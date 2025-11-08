from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import TextRequest, stylizeRequest
from chains.keypoints_chain import extract_keypoints
from chains.stylization_chain import stylize_text
from chains.summarization_chain import summarize_text_notes
from chains.rag_components import RAGPipeline
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'



rag_pipeline = RAGPipeline()



app = FastAPI(
    title="MorphNote",
    description="AI-Assisted Notes App using Generative AI",
    version="1.0.0"
)

# Enable CORS so browser-based frontends can call this API during development.
# For production, restrict `allow_origins` to your frontend domain(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to MorphNote",
    }


# API Routes for Plain Notes

@app.post("/keypoints")
async def keypoints(req: TextRequest):
    points = extract_keypoints(req.text)
    return {"keypoints": points}


@app.post("/stylize")
async def stylize(req: stylizeRequest):
    result = stylize_text(
        text=req.text,
        style=req.style,
        options=req.options.dict() if req.options else {}
    )
    return {"stylized_text": result}


@app.post("/summarize_text")
async def summarize(req: TextRequest):
    summary = summarize_text_notes(req.text)
    return {"summary": summary}


# API Routes for RAG Component

# @app.post("/process-pdf")
# async def process_pdf(file: UploadFile = File(...)):
#     return rag_pipeline.process_pdf(file)

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    print("Received file:", file.filename)
    result = await rag_pipeline.process_pdf(file)
    print("Result:", result)
    return result


@app.post("/query-pdf")
async def query_pdf(request: TextRequest):
    return rag_pipeline.query_pdf(request.text)

@app.delete("/delete-pdf")
async def delete_pdf():
    return rag_pipeline.delete_pdf()


