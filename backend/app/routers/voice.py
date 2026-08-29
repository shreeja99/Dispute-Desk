from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import os
import json
from groq import Groq
from app.services.voice_extraction_service import voice_extraction_service
from fastapi import Response
from app.services.tts_service import tts_service

router = APIRouter(prefix="/voice", tags=["voice"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Takes one audio clip from the merchant's mic and returns the
    transcribed text, using Groq's Whisper model.
    """
    audio_bytes = await audio.read()

    transcription = client.audio.transcriptions.create(
        file=(audio.filename, audio_bytes),
        model="whisper-large-v3-turbo",
    )

    return {"text": transcription.text}


@router.post("/converse")
async def converse(conversation_history: str = Form(...)):
    """
    Takes the full conversation so far (as a JSON string of
    {"role":..., "content":...} turns) and returns either a follow-up
    question to ask the merchant, or the final structured dispute data
    once enough information has been gathered.
    """
    try:
        history = json.loads(conversation_history)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="conversation_history must be valid JSON")

    result = voice_extraction_service.process_turn(history)
    return result

@router.post("/speak")
async def speak(text: str = Form(...)):
    """
    Takes text (the agent's follow-up question) and returns audio in
    the merchant's cloned voice, for the frontend to play back.
    """
    audio_bytes = tts_service.synthesize(text)
    return Response(content=audio_bytes, media_type="audio/wav")