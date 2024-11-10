"use client";
import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const AssistantButton = () => {
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [mediaRecorderInitialised, setMediaRecorderInitialised] =
    useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [thinking, setThinking] = useState<boolean>(false);
  let chunks: BlobPart[] = [];

  const playAudio = async (input: string): Promise<void> => {
    const CHUNK_SIZE = 1024;
    const voiceid = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceid}/stream`;
    console.log(input);

    const headers = {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
    };

    const data: any = JSON.stringify({
      text: input,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: data,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const audioContext = new window.AudioContext();
      const source = audioContext.createBufferSource();

      const audioBuffer = await response.arrayBuffer();
      const audioBufferDuration = audioBuffer.byteLength / CHUNK_SIZE;

      audioContext.decodeAudioData(audioBuffer, (buffer) => {
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });

      setTimeout(() => {
        source.stop();
        audioContext.close();
        setAudioPlaying(false);
      }, audioBufferDuration * 1000);
    } catch (error) {
      console.error("Error:", error);
      setAudioPlaying(false);
    }
  };

  const handlePlayButtonClick = (input: string): void => {
    setAudioPlaying(true);
    playAudio(input);
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorderInitialised) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    setThinking(true);

    toast("Thinking", {
      duration: 5000,
      icon: "💭",
      style: {
        borderRadius: "10px",
        background: "#1E1E1E",
        color: "#F9F9F9",
        border: "0.5px solid #3b3c3f",
        fontSize: "14px",
      },
      position: "top-right",
    });

    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };
  return (
    <div>
      <motion.div
        className="hover:scale-105 ease-in-out duration-500 hover:cursor-pointer text-[70px]"
        onClick={() => {
          if (thinking) {
            toast("Please wait for the assistant to finish.", {
              duration: 5000,
              icon: "🙌",
              style: {
                borderRadius: "10px",
                background: "#1E1E1E",
                color: "#F9F9F9",
                border: "0.5px solid #3b3c3f",
                fontSize: "14px",
              },
              position: "top-right",
            });
            setTimeout(() => {
              setThinking(false);
            }, 1500);
            return;
          }
          if (typeof window !== "undefined" && !mediaRecorderInitialised) {
            setMediaRecorderInitialised(true);
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                const newMediaRecorder = new MediaRecorder(stream);

                newMediaRecorder.onstart = () => {
                  chunks = [];
                };

                newMediaRecorder.ondataavailable = (e) => {
                  chunks.push(e.data);
                };

                newMediaRecorder.onstop = async () => {
                  const audioBlob = new Blob(chunks, { type: "audio/webm" });
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);                  

                  audio.onerror = function (error) {
                    console.error("Error playing audio:", error);
                  };

                  try {
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);

                    reader.onloadend = async function () {
                      const base64Audio = (reader.result as string).split(
                        ","
                      )[1];

                      if (base64Audio) {
                        const response: any = await fetch("/api/speechToText", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ audio: base64Audio }),
                        });

                        const data = await response.json();
                        
                        if (response.status !== 200) {
                          throw (
                            data.error ||
                            new Error(
                              `Request failed with status ${response.status}`
                            )
                          );
                        }

                        

                        const completion = await axios.post("/api/chat", {
                          question: data,
                        });

                        handlePlayButtonClick(completion.data.content);
                      }
                    };
                  } catch (err) {
                    console.log(err);
                  }
                };
                setMediaRecorder(newMediaRecorder);
              })
              .catch((err) => {
                console.error("Error accessing microphone:", err);
              });
          }
          if (!mediaRecorderInitialised) {
            toast(
              "Please grant access to your microphone. Click the button again to speak.",
              {
                duration: 5000,
                icon: "",
                style: {
                  borderRadius: "10px",
                  background: "#1E1E1E",
                  color: "#F9F9F9",
                  border: "0.5px solid #3b3c3f",
                  fontSize: "14px",
                },
                position: "top-right",
              }
            );
            return;
          }
          recording
            ? null
            : toast("Listening - Click again to send.", {
                duration: 5000,
                icon: "🟢",
                style: {
                  borderRadius: "10px",
                  background: "#1E1E1E",
                  color: "#F9F9F9",
                  border: "0.5px solid #3b3c3f",
                  fontSize: "14px",
                },
                position: "top-right",
              });

          recording ? stopRecording() : startRecording();
        }}
      >
        <div className="assistant-container">
          <div className="green"></div>
          <div className="pink"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssistantButton;
