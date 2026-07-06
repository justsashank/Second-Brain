from fastapi import FastAPI

app = FastAPI(
    title="Second Brain API"
)


@app.get("/")
def home():
    return {
        "message": "Second Brain Backend Running"
    }