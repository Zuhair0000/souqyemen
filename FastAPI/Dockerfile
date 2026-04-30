# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies (PyTorch, FastAPI, Pandas, TextBlob, etc.)
# Using --no-cache-dir keeps the container size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy your ML code, encoders, and .pth weight files
COPY . .

# Expose the port FastAPI runs on (usually 8000)
EXPOSE 8000

# Command to run the FastAPI server 
# Assuming your FastAPI instance inside ai_server.py is named 'app'
CMD ["uvicorn", "ai_server:app", "--host", "0.0.0.0", "--port", "8000"]