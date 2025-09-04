import { useEffect, useRef, useState } from "react";
import { API_URL } from "./config"; // 👈 import config

export default function ChatBox({ layoutKey }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  
  // at the top, with your other hooks
  const [thread, setThread] = useState([]);      

  // [{role: 'user'|'assistant', text: string}]
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const taRef = useRef(null);
  const containerRef = useRef(null);
// turn the API JSON into a readable bot reply

function formatReply(data) 
{
  // you can customize this function to get your response as needed.
  if (!data) return <p>No data received.</p>;

  const hasStatutes = Array.isArray(data.statutes) && data.statutes.length > 0;
  const hasCases = Array.isArray(data.similar_cases) && data.similar_cases.length > 0;
  const hasArgs = Array.isArray(data.arguments) && data.arguments.length > 0;
  const hasSteps = Array.isArray(data.next_steps) && data.next_steps.length > 0;

  return (
    <div className="bot-reply">
      {/* Statutes */}
      {hasStatutes && (
        <>
          <p>📜 <strong>Statutes:</strong></p>
          {data.statutes.slice(0, 2).map((s, i) => (
            <p key={`statute-${i}`}>
              {i + 1}. {s?.title}
              {s?.citation ? ` — ${s.citation}` : ""}
              {" "}
              {s?.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer">View</a>
              )}
            </p>
          ))}
        </>
      )}

      {/* Similar cases */}
      {hasCases && (
        <>
          <p>📚 <strong>Similar cases:</strong></p>
          {data.similar_cases.slice(0, 2).map((c, i) => (
            <p key={`case-${i}`}>
              {i + 1}. {c?.title}
              {c?.jurisdiction ? ` — ${c.jurisdiction}` : ""}
              {" "}
              {c?.url && (
                <a href={c.url} target="_blank" rel="noopener noreferrer">View</a>
              )}
            </p>
          ))}
        </>
      )}

      {/* Arguments */}
      {hasArgs && (
        <>
          <p>🧠 <strong>Arguments:</strong></p>
          {data.arguments.slice(0, 2).map((a, i) => (
            <p key={`arg-${i}`}>{i + 1}. {a?.point}</p>
          ))}
        </>
      )}

      {/* Next steps */}
      {hasSteps && (
        <>
          <p>✅ <strong>Next steps:</strong></p>
          {data.next_steps.map((n, i) => (
            <p key={`step-${i}`}>{i + 1}. {n}</p>
          ))}
        </>
      )}
    </div>
  );
}


  // 👇 Suggestions: add, remove, or edit freely
  const suggestions = [
    {
      label: "💡 Unpaid invoice (CA)",
      text: "Buyer hasn’t paid my $8,500 invoice in California after delivery."
    },
    {
      label: "💡 Security deposit",
      text: "Landlord kept my $2,000 security deposit after move-out in California. What are my options?"
    },
    {
      label: "💡 Defective product",
      text: "Received a defective $1,200 appliance in Texas; seller refuses refund. What remedies do I have?"
    },
    {
      label: "💡 Contract breach",
      text: "Freelance client ended the project early without paying for completed milestones. How should I proceed?"
    }
  ];

  const autoSize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const onPickFiles = () => fileInputRef.current?.click();

  const onFilesSelected = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("California breach of contract");
    const text = message.trim();
    if (!text && files.length === 0) return;

    const formData = new FormData();
    formData.append("message", text);
    files.forEach((file, i) => {
      formData.append("files", file); // "files" matches backend field name
    });
    
    setThread((t) => [...t, { role: "user", text }]);
    setLoading(true);
    try 
     {
      //let query ="California breach of contract";
      console.log(API_URL);
      console.log(message);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }), 
      });

      const data = await res.json();
      console.log(data);

      // 3) push assistant message
      setThread((t) => [...t, { role: "assistant", text: formatReply(data) }]);
    }
      catch (err) {
        setThread((t) => [...t, { role: "assistant", text: "Sorry—couldn’t reach the API." }]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    // clear inputs (keep your existing resets)
    setMessage("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    autoSize();
  };

  // Resize on mount / window resize / layout change
  useEffect(() => {
    autoSize();
    const onResize = () => autoSize();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => autoSize());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [layoutKey]);

  // Also resize whenever message changes (handles chip clicks)
  useEffect(() => {
    autoSize();
  }, [message]);

  const applySuggestion = (text) => {
    setMessage(text);
    // autosize runs via the message effect
  };

return (
  <div ref={containerRef} className="chat-center">
    
    {/* Chat thread */}
      <div className="chat-thread" aria-live="polite">
        {thread.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
            <div style={{"width":"640px","fontSize":"13px"}}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="msg bot">Thinking…</div>}
      </div>

    <form className="chatbox" onSubmit={onSubmit}>
      {files.length > 0 && (
        <div className="chat-attachments" aria-live="polite">
          {files.map((f, i) => (
            <span key={i} className="chip" title={`${f.name} (${Math.round(f.size/1024)} KB)`}>
              {f.name}
            </span>
          ))}
        </div>
      )}
      
      <div className="chat-input-row">
        <textarea
          ref={taRef}
          className="chat-textarea"
          placeholder="Describe your situation…"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={autoSize}
        />

        <div className="chat-actions">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={onFilesSelected}
          />
          <button type="button" className="icon-btn" onClick={onPickFiles} title="Upload files" aria-label="Upload files">📎</button>
          <button type="submit" className="send-btn" disabled={!message.trim() && files.length === 0} title="Send" aria-label="Send message">➤</button>
        </div>
      </div>

      {/* ⬇️  Bottom-left suggestions */}
      <div className="suggestion-row bottom-left">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            className="suggestion-chip"
            onClick={() => applySuggestion(s.text)}
            title="Insert example"
            aria-label={`Insert example: ${s.label}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Disclaimer stays last */}
      <p className="chat-disclaimer">
        ⚖️ This is legal information, not legal advice. Always verify sources.
      </p>
    </form>
  </div>
);
}
