import pandas as pd
from sqlalchemy import create_engine
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Connect to your Live AWS RDS Database
print("Connecting to live database...")
DB_URI = "mysql+pymysql://root:Zoherama1122@souqyemen.cszggy2wqm5a.us-east-1.rds.amazonaws.com/souqyemen"
engine = create_engine(DB_URI)

# 2. Fetch the fresh data
print("Fetching fresh ratings and products from MySQL...")
interactions_df = pd.read_sql("SELECT user_id, product_id, rating FROM reviews", engine)
products_df = pd.read_sql("SELECT id, name, price, image FROM products", engine)

# 3. Save them to CSV so ai_server.py can read them without breaking
interactions_df.to_csv('souqyemen_interactions.csv', index=False)
products_df.to_csv('souqyemen_products_1000.csv', index=False)
print(f"Downloaded {len(interactions_df)} reviews and {len(products_df)} products.")

# 4. Encode Users and Products (Create mapping dictionaries)
user_encoder = LabelEncoder()
product_encoder = LabelEncoder()

interactions_df['user_encoded'] = user_encoder.fit_transform(interactions_df['user_id'])
interactions_df['product_encoded'] = product_encoder.fit_transform(interactions_df['product_id'])

# Save the encoders for the FastAPI server
joblib.dump(user_encoder, 'user_encoder.joblib')
joblib.dump(product_encoder, 'product_encoder.joblib')

# 5. Define the PyTorch Dataset
class InteractionDataset(Dataset):
    def __init__(self, users, products, ratings):
        self.users = torch.tensor(users, dtype=torch.long)
        self.products = torch.tensor(products, dtype=torch.long)
        self.ratings = torch.tensor(ratings, dtype=torch.float32)

    def __len__(self):
        return len(self.users)

    def __getitem__(self, idx):
        return self.users[idx], self.products[idx], self.ratings[idx]

dataset = InteractionDataset(
    interactions_df['user_encoded'].values,
    interactions_df['product_encoded'].values,
    interactions_df['rating'].values
)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# 6. Define the exact same Model Architecture as your server
class SouqYemenRecommender(nn.Module):
    def __init__(self, num_users, num_products, embedding_dim=32):
        super(SouqYemenRecommender, self).__init__()
        self.user_embedding = nn.Embedding(num_embeddings=num_users, embedding_dim=embedding_dim)
        self.product_embedding = nn.Embedding(num_embeddings=num_products, embedding_dim=embedding_dim)
        self.fc1 = nn.Linear(in_features=embedding_dim * 2, out_features=64)
        self.fc2 = nn.Linear(in_features=64, out_features=32)
        self.output = nn.Linear(in_features=32, out_features=1)
        
    def forward(self, user_tensor, product_tensor):
        u = self.user_embedding(user_tensor)
        p = self.product_embedding(product_tensor)
        x = torch.cat([u, p], dim=1)
        import torch.nn.functional as F
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.output(x).squeeze()

# 7. Initialize Model, Loss, and Optimizer
num_users = len(user_encoder.classes_)
num_products = len(product_encoder.classes_)
model = SouqYemenRecommender(num_users=num_users, num_products=num_products)

criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 8. Train the Model
epochs = 15
print("Starting AI Training...")
for epoch in range(epochs):
    total_loss = 0
    for users, products, ratings in dataloader:
        optimizer.zero_grad()
        predictions = model(users, products)
        loss = criterion(predictions, ratings)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/{epochs} - Loss: {total_loss/len(dataloader):.4f}")

# 9. Save the new brain
torch.save(model.state_dict(), 'souqyemen_ncf_weights.pth')
print("✅ Training Complete! New weights and CSVs saved successfully.")