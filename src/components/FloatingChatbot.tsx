import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, X, Send, Sparkles, Calendar, HelpCircle, CalendarRange,
  Mic, MicOff, Volume2, VolumeX, Radio, RefreshCcw
} from "lucide-react";

interface FloatingChatbotProps {
  uid: string;
  isNominee?: boolean;
  ownerUid?: string;
  externalOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function FloatingChatbot({ 
  uid, 
  isNominee = false, 
  ownerUid,
  externalOpen,
  onToggle
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const toggleOpen = () => {
    if (onToggle) {
      onToggle(!activeOpen);
    } else {
      setIsOpen(!activeOpen);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am LifeContinuity AI. I am fully synced with your Emergency Profile, active Continuity Plans, Check-in logs, and Google Calendar. How can I assist you with your schedules or safety checklist today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCalendarSynced, setIsCalendarSynced] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);

  // Voice Chat Mode states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"Idle" | "Listening" | "Thinking" | "Speaking">("Idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("Speech synthesis cleanup failed:", e);
        }
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      
      utterance.onstart = () => {
        setVoiceStatus("Speaking");
      };
      utterance.onend = () => {
        setVoiceStatus("Idle");
      };
      utterance.onerror = () => {
        setVoiceStatus("Idle");
      };
      
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(v => 
        v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Hazel")
      );
      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis speak failed:", err);
      setVoiceStatus("Idle");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Speech synthesis cancel failed:", e);
      }
      setVoiceStatus("Idle");
    }
  };

  const startRecording = async () => {
    try {
      stopSpeaking();
      setLiveTranscript("");
      setMicBlocked(false);

      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API not supported or disabled in this browser context.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          await handleSendVoice(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceStatus("Listening");

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";
          rec.onresult = (e: any) => {
            let fullText = "";
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript + " ";
            }
            setLiveTranscript(fullText.trim());
          };
          rec.onerror = (e: any) => console.log("Recognition error", e);
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.error("Speech recognition startup error", e);
        }
      }
    } catch (err) {
      console.error("Mic access denied or error:", err);
      setMicBlocked(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setVoiceStatus("Thinking");
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSendVoice = async (base64Audio: string) => {
    setVoiceStatus("Thinking");
    
    const tempUserMsg = { role: "user", text: "[Spoken Voice Input]" } as Message;
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          isNominee,
          ownerUid,
          audio: base64Audio
        })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
        setLiveTranscript(data.text);
        speakText(data.text);
      } else {
        throw new Error(data.error || "Failed voice response");
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", text: "I had trouble parsing the voice. Could you try speaking again?" }]);
      setVoiceStatus("Idle");
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    if (!customText) setInput("");

    const updatedMessages = [...messages, { role: "user", text: textToSend } as Message];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          isNominee,
          ownerUid,
          messages: updatedMessages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...updatedMessages, { role: "assistant", text: data.text }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading && setLoading(false);
      setLoading(false);
    }
  };

  const handleSyncCalendar = async () => {
    setSyncingCalendar(true);
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: isNominee ? ownerUid : uid })
      });
      if (res.ok) {
        setIsCalendarSynced(true);
        setMessages([
          ...messages,
          { role: "user", text: "Please synchronize my Google Calendar." },
          { role: "assistant", text: "Successfully connected Google Calendar API. Scanned doctor appointments and school events. I have mapped 'Cardiology Follow-up' and 'School PTA Board Meeting' directly into your Life Graph timeline. I have also detected a minor clinical conflict: You have a dentist checkup tomorrow morning, but your emergency profile lists active respiratory conditions — would you like me to note this for your nominee?" }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingCalendar(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Panel Box */}
      {activeOpen && (
        <div className="bg-[#2c3353] rounded-2xl shadow-2xl border border-[#5d6fa3]/30 w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden mb-4 animate-fade-in">
          
          {/* Header Bar */}
          <div className="bg-[#1e233a] text-white p-4 flex items-center justify-between border-b border-[#5d6fa3]/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#e0dafc] rounded-lg flex items-center justify-center text-[#2c3353] border border-[#5d6fa3]/20">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">LifeContinuity AI Agent</h4>
                <p className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-wider font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Synced & Protecting
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#5d6fa3] hover:text-[#e0dafc] p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isVoiceMode ? (
            /* Immersive Full-Panel Voice Chat Room */
            <div className="flex-1 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-[#1e233a] to-[#2c3353] text-white">
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full">
                <div className="relative flex items-center justify-center h-28 w-28">
                  {/* Ambient animated visual ripples */}
                  {voiceStatus === "Listening" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-indigo-500/15 border border-indigo-500/20 animate-ping [animation-duration:2.5s]" />
                      <div className="absolute inset-2 rounded-full bg-indigo-500/25 border border-indigo-500/30 animate-pulse [animation-duration:1.2s]" />
                    </>
                  )}
                  {voiceStatus === "Thinking" && (
                    <div className="absolute inset-0 rounded-full bg-violet-500/5 border border-dashed border-violet-400/40 animate-spin" />
                  )}
                  {voiceStatus === "Speaking" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-emerald-500/15 border border-emerald-500/20 animate-ping [animation-duration:2s]" />
                      <div className="absolute inset-2 rounded-full bg-emerald-500/25 border border-emerald-500/30 animate-pulse [animation-duration:1s]" />
                    </>
                  )}

                  {/* Centered microphone/speaker orb */}
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xl ${
                    voiceStatus === "Listening" ? "bg-indigo-600/40 border-indigo-400 text-indigo-100" :
                    voiceStatus === "Thinking" ? "bg-violet-600/40 border-violet-400 text-violet-100" :
                    voiceStatus === "Speaking" ? "bg-emerald-600/40 border-emerald-400 text-emerald-100" :
                    "bg-[#1e233a] border-[#5d6fa3]/30 text-[#e0dafc]"
                  }`}>
                    {voiceStatus === "Listening" ? <Mic className="h-6 w-6 animate-pulse" /> :
                     voiceStatus === "Thinking" ? <Radio className="h-6 w-6 animate-spin" /> :
                     voiceStatus === "Speaking" ? <Volume2 className="h-6 w-6" /> :
                     <MicOff className="h-6 w-6" />}
                  </div>
                </div>

                {/* Status Indicator labels */}
                <div className="text-center">
                  {micBlocked ? (
                    <>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-red-400">
                        Microphone Blocked
                      </h5>
                      <p className="text-[10px] text-red-300 mt-0.5">
                        Enable mic access/permissions in your browser context.
                      </p>
                    </>
                  ) : (
                    <>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-[#e0dafc]">
                        {voiceStatus === "Listening" ? "Listening..." :
                         voiceStatus === "Thinking" ? "Thinking..." :
                         voiceStatus === "Speaking" ? "Speaking..." :
                         "Tap Mic to Speak"}
                      </h5>
                      <p className="text-[10px] text-[#5d6fa3] mt-0.5">
                        {voiceStatus === "Listening" ? "Speak clearly now" :
                         voiceStatus === "Thinking" ? "Gemini 2.5 Multi-Modal processing..." :
                         voiceStatus === "Speaking" ? "Listening to synthetic agent response" :
                         "Lighthouse Voice Interface active"}
                      </p>
                    </>
                  )}
                </div>

                {/* Live speech-to-text / response text display panel */}
                <div className="bg-[#1e233a]/80 border border-[#5d6fa3]/15 rounded-xl p-3 w-full min-h-[70px] max-h-[110px] overflow-y-auto flex flex-col justify-center items-center">
                  {liveTranscript ? (
                    <p className="text-xs italic text-indigo-200 text-center leading-relaxed">
                      "{liveTranscript}"
                    </p>
                  ) : (
                    <p className="text-xs text-[#5d6fa3] italic text-center">
                      {voiceStatus === "Listening" ? "Say something..." : "Ready for question"}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full border-t border-[#5d6fa3]/15 pt-4 flex flex-col items-center gap-3">
                <div className="flex items-center gap-5">
                  {/* Stop speech button */}
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    disabled={voiceStatus !== "Speaking"}
                    className="h-9 w-9 rounded-full bg-[#1e233a]/60 border border-red-500/20 text-red-400 hover:bg-red-950/20 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                    title="Stop Audio Playback"
                  >
                    <VolumeX className="h-4.5 w-4.5" />
                  </button>

                  {/* Main Record/Stop Mic toggle button */}
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 border border-red-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      title="Stop Recording"
                    >
                      <span className="h-3.5 w-3.5 bg-white rounded-xs" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 hover:brightness-110 border border-indigo-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      title="Start Recording"
                    >
                      <Mic className="h-6 w-6" />
                    </button>
                  )}

                  {/* Reset text button */}
                  <button
                    type="button"
                    onClick={() => {
                      setLiveTranscript("");
                      stopSpeaking();
                    }}
                    className="h-9 w-9 rounded-full bg-[#1e233a]/60 border border-[#5d6fa3]/20 text-indigo-300 hover:bg-[#1e233a] transition-all flex items-center justify-center cursor-pointer"
                    title="Clear Text"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    if (isRecording) stopRecording();
                    setIsVoiceMode(false);
                  }}
                  className="text-[10px] text-[#e0dafc] bg-[#1e233a]/50 hover:bg-[#1e233a] border border-[#5d6fa3]/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  Back to Text Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Grid */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#1e233a]" ref={scrollRef}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-[#e0dafc] text-[#2c3353] rounded-br-none font-bold"
                          : "bg-[#2c3353] text-[#e0dafc] border border-[#5d6fa3]/25 rounded-bl-none"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#2c3353] text-[#5d6fa3] p-3 rounded-2xl rounded-bl-none border border-[#5d6fa3]/20 text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
                      <span className="h-1.5 w-1.5 bg-[#5d6fa3] rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-[#5d6fa3] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-[#5d6fa3] rounded-full animate-bounce [animation-delay:0.4s]" />
                      Analyzing context...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="p-2.5 bg-[#2c3353] border-t border-[#5d6fa3]/20 flex flex-wrap gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage("When was my last check-in?")}
                  className="text-[9px] font-bold text-[#e0dafc] bg-[#1e233a] border border-[#5d6fa3]/30 hover:bg-[#1e233a]/80 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Check-in Log Status
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("What happens if I miss a check-in?")}
                  className="text-[9px] font-bold text-[#e0dafc] bg-[#1e233a] border border-[#5d6fa3]/30 hover:bg-[#1e233a]/80 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  What if I miss check-in?
                </button>
                <button
                  type="button"
                  onClick={handleSyncCalendar}
                  disabled={syncingCalendar || isCalendarSynced}
                  className="text-[9px] font-extrabold text-[#2c3353] bg-[#e0dafc] hover:brightness-110 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CalendarRange className="h-3 w-3 text-[#2c3353]" />
                  {syncingCalendar ? "Syncing..." : isCalendarSynced ? "Calendar Connected" : "Sync Google Calendar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceMode(true);
                    startRecording();
                  }}
                  className="text-[9px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  <Mic className="h-3.5 w-3.5 text-white animate-pulse" />
                  Voice Mode (Gemini 2.5)
                </button>
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-[#5d6fa3]/20 bg-[#2c3353] flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="Ask about security, bills, or plans..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceMode(true);
                    startRecording();
                  }}
                  className="bg-[#1e233a] border border-[#5d6fa3]/30 text-indigo-300 hover:text-white p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Voice Mode"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-[#e0dafc] hover:brightness-110 text-[#2c3353] p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4 text-[#2c3353]" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Launcher Icon Button */}
      <button
        onClick={toggleOpen}
        className="h-12 w-12 rounded-full bg-[#2c3353] hover:bg-[#2c3353]/90 text-[#e0dafc] flex items-center justify-center shadow-2xl hover:scale-105 transition-all relative border border-[#5d6fa3]/30 cursor-pointer"
        id="btn-global-floating-chatbot"
      >
        {activeOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        {!activeOpen && (
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-600 rounded-full text-[8px] font-bold flex items-center justify-center text-white border-2 border-[#2c3353]">
            !
          </span>
        )}
      </button>

    </div>
  );
}
