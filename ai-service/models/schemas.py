from pydantic import BaseModel, Field

class TextRequest(BaseModel):
    text: str 

class Options(BaseModel):
    length: str = "medium"
    creativity: str = "balanced"

class stylizeRequest(BaseModel):
    text: str
    style: str
    options: Options = Field(default=Options(length="medium", creativity="low"))