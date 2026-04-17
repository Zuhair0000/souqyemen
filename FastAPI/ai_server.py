from fastapi import FastAPI, HTTPException
import torch
import torch.nn as nn
import joblib
import pandas as pd
import numpy as np

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

app = FastAPI(title="SouqYemen AI Engine")

print("Booting up AI Engine...")
df = pd.read_csv('souqyemen_interactions.csv')
products_df = pd.read_csv('souqyemen_products_1000.csv')

user_encoder = joblib.load('user_encoder.joblib')
product_encoder = joblib.load('product_encoder.joblib')

model = SouqYemenRecommender(num_users=len(user_encoder.classes_), num_products=len(product_encoder.classes_))
model.load_state_dict(torch.load('souqyemen_ncf_weights.pth', weights_only=True))
model.eval()

@app.get("/api/recommend/{user_id}")
def get_recommendations(user_id: int, top_n: int = 5):
    try:
        user_encoded = user_encoder.transform([user_id])[0]
    except ValueError:
        raise HTTPException(status_code=404, detail="User ID not found in AI database.")
    
    user_history = df[df['user_id'] == user_id]['product_id'].tolist()
    all_products = df['product_id'].unique().tolist()
    candidate_products = [p for p in all_products if p not in user_history]
    candidate_products_encoded = product_encoder.transform(candidate_products)
    
    user_tensor = torch.tensor([user_encoded] * len(candidate_products_encoded), dtype=torch.long)
    product_tensor = torch.tensor(candidate_products_encoded, dtype=torch.long)
    
    with torch.no_grad():
        predicted_ratings = model(user_tensor, product_tensor)
        
    top_scores, top_indices = torch.topk(predicted_ratings, top_n)
    top_encoded_products = product_tensor[top_indices].numpy()
    top_real_products = product_encoder.inverse_transform(top_encoded_products)
    
    recs = products_df[products_df['id'].isin(top_real_products)].copy()
    recs['predicted_rating'] = top_scores.numpy()
    recs = recs.sort_values(by='predicted_rating', ascending=False)
    
    return {
        "user_id": user_id,
        "recommendations": recs.to_dict(orient="records")
    }