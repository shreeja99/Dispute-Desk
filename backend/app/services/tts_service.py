import os
from cartesia import Cartesia

client = Cartesia(api_key=os.getenv("CARTESIA_API_KEY"))
VOICE_ID = os.getenv("CARTESIA_VOICE_ID")


class TTSService:
    """
    Converts the voice agent's follow-up questions into spoken audio,
    using the merchant's own cloned voice. This only ever speaks text
    our system already generated (the clarifying question) -- it never
    generates new content, so there's no risk of it saying something
    ungrounded.
    """

    def synthesize(self, text: str) -> bytes:
        audio_generator = client.tts.bytes(
            model_id="sonic-2",
            transcript=text,
            voice={"mode": "id", "id": VOICE_ID},
            language="en",
            output_format={
                "container": "wav",
                "encoding": "pcm_s16le",
                "sample_rate": 44100,
            },
        )
        return b"".join(chunk for chunk in audio_generator)


tts_service = TTSService()