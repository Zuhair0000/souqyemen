import mysql.connector
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import joblib
from textblob import TextBlob
from sklearn.preprocessing import LabelEncoder


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
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.output(x).squeeze()

def calculate_smart_rating(row):
    """
    Handles both star ratings and text comments.
    If no comment exists, it boosts 5-star ratings to give them more 'weight'.
    """
    raw_rating = float(row['rating'])
    comment = row['comment']

    if not comment or str(comment).strip().lower() in ["none", "", "null"]:
        if raw_rating == 5.0:
            return 5.2
        return raw_rating
    
    analysis = TextBlob(str(comment))
    polarity = analysis.sentiment.polarity
    
    smart_rating = raw_rating
    if polarity > 0.4:  
        smart_rating += 0.3
    elif polarity < -0.1: 
        smart_rating -= 1.5
        
    return max(1.0, min(5.0, smart_rating))

def fetch_real_data():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",        
            password="Zoherama1122", 
            database="souqyemen"
        )
        query = "SELECT user_id, product_id, rating, comment FROM reviews"
        df = pd.read_sql(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return pd.DataFrame()

def update_ai():
    print("🚀 Initializing AI Brain Sync...")
    df = fetch_real_data()
    
    if df.empty:
        print("⚠️ No reviews found. Add some ratings in the app first!")
        return

    print("🧠 Processing Smart Ratings (NLP + Signal Boosting)...")
    df['rating'] = df.apply(calculate_smart_rating, axis=1)

    print("🔄 Updating Encoders with new users/products...")
    try:
        # Load existing encoders
        user_encoder = joblib.load('user_encoder.joblib')
        product_encoder = joblib.load('product_encoder.joblib')
        
        # Fit them on a combination of old known classes + new IDs from the database
        user_encoder.fit(list(user_encoder.classes_) + df['user_id'].tolist())
        product_encoder.fit(list(product_encoder.classes_) + df['product_id'].tolist())
    except FileNotFoundError:
        print("⚠️ Missing Encoders! Initializing fresh encoders from current data...")
        user_encoder = LabelEncoder()
        product_encoder = LabelEncoder()
        user_encoder.fit(df['user_id'])
        product_encoder.fit(df['product_id'])
        
    # Save the expanded/new encoders back to disk
    joblib.dump(user_encoder, 'user_encoder.joblib')
    joblib.dump(product_encoder, 'product_encoder.joblib')

    # Transform IDs to continuous integers for PyTorch
    df['user_id_encoded'] = user_encoder.transform(df['user_id'])
    df['product_id_encoded'] = product_encoder.transform(df['product_id'])

    # Convert to PyTorch Tensors
    users = torch.tensor(df['user_id_encoded'].values, dtype=torch.long)
    products = torch.tensor(df['product_id_encoded'].values, dtype=torch.long)
    ratings = torch.tensor(df['rating'].values, dtype=torch.float32)

    # Initialize model with the NEW vocabulary size
    model = SouqYemenRecommender(len(user_encoder.classes_), len(product_encoder.classes_))
    
    print("🔬 Performing Embedding Surgery (Warm-Start)...")
    try:
        # Load the old learned weights
        old_state_dict = torch.load('souqyemen_ncf_weights.pth', weights_only=True)
        new_state_dict = model.state_dict()
        
        for name, param in old_state_dict.items():
            if name in new_state_dict:
                # If it's a standard layer (like Linear) that hasn't changed size, copy it exactly
                if param.shape == new_state_dict[name].shape:
                    new_state_dict[name].copy_(param)
                # If it's an embedding layer that HAS changed size, copy old rows into the new matrix
                elif 'embedding' in name:
                    old_size = param.shape[0]
                    new_state_dict[name][:old_size, :] = param
                    
        # Apply the merged weights to the model
        model.load_state_dict(new_state_dict)
        print("✅ Successfully mapped old memories to expanded embedding layers!")
    except Exception as e:
        print(f"⚠️ Could not map old weights (starting fresh training): {e}")

    # Setup Training
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print(f"📈 Fine-tuning with {len(df)} real interactions...")
    
    model.train()
    for epoch in range(12):
        optimizer.zero_grad()
        preds = model(users, products)
        loss = criterion(preds, ratings)
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 3 == 0:
            print(f"   Epoch {epoch+1}/12 | Loss: {loss.item():.4f}")

    # Save the newly trained model
    torch.save(model.state_dict(), 'souqyemen_ncf_weights.pth')
    print("✅ AI Brain successfully synchronized and updated!")

if __name__ == "__main__":
    update_ai()