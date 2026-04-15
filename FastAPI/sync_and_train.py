import mysql.connector
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import joblib
from textblob import TextBlob

# --- 1. THE AI ARCHITECTURE (The Blueprint) ---
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

# --- 2. THE INTELLIGENCE ENGINE (NLP & Signal Logic) ---
def calculate_smart_rating(row):
    """
    Handles both star ratings and text comments.
    If no comment exists, it boosts 5-star ratings to give them more 'weight'.
    """
    raw_rating = float(row['rating'])
    comment = row['comment']

    # Scenario A: No Comment Provided
    if not comment or str(comment).strip().lower() in ["none", "", "null"]:
        # Boost 5-star ratings to 5.2 to make them stand out in the loss calculation
        if raw_rating == 5.0:
            return 5.2
        return raw_rating
    
    # Scenario B: Comment Exists (NLP Analysis)
    analysis = TextBlob(str(comment))
    polarity = analysis.sentiment.polarity
    
    smart_rating = raw_rating
    if polarity > 0.4:  # Positive words boost the signal
        smart_rating += 0.3
    elif polarity < -0.1: # Negative words drop the signal significantly
        smart_rating -= 1.5
        
    return max(1.0, min(5.0, smart_rating))

# --- 3. DATA ACQUISITION ---
def fetch_real_data():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",        
            password="Zoherama1122", # <-- Update with your actual MySQL password
            database="souqyemen"
        )
        # Fetching all relevant columns for the feedback loop
        query = "SELECT user_id, product_id, rating, comment FROM reviews"
        df = pd.read_sql(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return pd.DataFrame()

# --- 4. THE UPDATE LOOP ---
def update_ai():
    print("🚀 Initializing AI Brain Sync...")
    df = fetch_real_data()
    
    if df.empty:
        print("⚠️ No reviews found. Add some ratings in the app first!")
        return

    # Process Ratings with our Smart Logic
    print("🧠 Processing Smart Ratings (NLP + Signal Boosting)...")
    df['rating'] = df.apply(calculate_smart_rating, axis=1)

    # Load Encoders (The ID Maps)
    try:
        user_encoder = joblib.load('user_encoder.joblib')
        product_encoder = joblib.load('product_encoder.joblib')
    except FileNotFoundError:
        print("❌ Missing Encoders! Ensure user_encoder.joblib exists.")
        return

    # Handle Encoding
    try:
        df['user_id_encoded'] = user_encoder.transform(df['user_id'])
        df['product_id_encoded'] = product_encoder.transform(df['product_id'])
    except ValueError as e:
        print(f"⚠️ ID Mismatch: {e}")
        return

    # Convert to PyTorch Tensors
    users = torch.tensor(df['user_id_encoded'].values, dtype=torch.long)
    products = torch.tensor(df['product_id_encoded'].values, dtype=torch.long)
    ratings = torch.tensor(df['rating'].values, dtype=torch.float32)

    # Load current model state
    model = SouqYemenRecommender(len(user_encoder.classes_), len(product_encoder.classes_))
    try:
        model.load_state_dict(torch.load('souqyemen_ncf_weights.pth', weights_only=True))
    except Exception as e:
        print(f"❌ Could not load weights: {e}")
        return

    # Set up Training
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print(f"📈 Fine-tuning with {len(df)} real interactions...")
    
    model.train()
    for epoch in range(12): # 12 epochs is the 'sweet spot' for small data updates
        optimizer.zero_grad()
        preds = model(users, products)
        loss = criterion(preds, ratings)
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 3 == 0:
            print(f"   Epoch {epoch+1}/12 | Loss: {loss.item():.4f}")

    # Save the updated model
    torch.save(model.state_dict(), 'souqyemen_ncf_weights.pth')
    print("✅ AI Brain successfully synchronized and updated!")

if __name__ == "__main__":
    update_ai()