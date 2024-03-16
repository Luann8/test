import { Uploader } from "uploader";
import { UploadButton } from "react-uploader";
import Metrics from "./Metrics";
const uploader = Uploader({
  apiKey: "public_kW15biSARCJN7FAz6rANdRg3pNkh",
});

const options = {
  apiKey: "public_kW15biSARCJN7FAz6rANdRg3pNkh",
  maxFileCount: 1,
  mimeTypes: [
    "image/jpeg",
    "image/png",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
  ],
  showFinishButton: false,
  preview: true,
  editor: {
    images: {
      preview: false,
      crop: false,
    },
  },
  styles: {
    colors: {
      active: "#1f2937",
      error: "#d23f4d",
      primary: "#4b5563",
    },
    fontFamilies: {
      base: "inter, -apple-system, blinkmacsystemfont, Segoe UI, helvetica, arial, sans-serif",
    },
    fontSizes: {
      base: 16,
    },
  },
};

const ChatForm = ({
  prompt,
  setPrompt,
  onSubmit,
  handleFileUpload,
  metrics,
  completion,
}) => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmit(prompt);
    setPrompt("");
    event.target.rows = 1;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };
  

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 text-black">
      <div className="container mx-auto px-5 py-8">
        <Metrics
          startedAt={metrics.startedAt}
          firstMessageAt={metrics.firstMessageAt}
          completedAt={metrics.completedAt}
          completion={completion}
        />

        <form className="flex items-center space-x-3" onSubmit={handleSubmit}>
          <UploadButton
            uploader={uploader}
            options={options}
            onComplete={(files) => handleFileUpload(files[0])}
          >
            {({ onClick }) => (
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={onClick}
              >
                Upload
              </button>
            )}
          </UploadButton>
          <textarea
            autoComplete="off"
            autoFocus
            name="prompt"
            className="flex-grow border border-gray-300 rounded-md py-2 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Digite sua mensagem..."
            required={true}
            value={prompt}
            rows={1}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={(e) => {
              const lineCount = e.target.value.split("\n").length;
              e.target.rows = lineCount > 10 ? 10 : lineCount;
            }}
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-300" type="submit">
  Chat
</button>
        </form>
      </div>
    </footer>
  );
}

export default ChatForm;