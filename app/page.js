"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import ChatForm from "./components/ChatForm";
import Message from "./components/Message";
import SlideOver from "./components/SlideOver";
import EmptyState from "./components/EmptyState";
import QueuedSpinner from "./components/QueuedSpinner";
import { Cog6ToothIcon, CodeBracketIcon } from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";
import { Toaster, toast } from "react-hot-toast";
import { LlamaTemplate } from "../src/prompt_template";

import { countTokens } from "./src/tokenizer.js";

const MODELS = [
  {
    id: "meta/llama-2-7b-chat",
    name: "Llama 2 7B",
    shortened: "7B",
  },
  {
    id: "meta/llama-2-13b-chat",
    name: "Llama 2 13B",
    shortened: "13B",
  },
  {
    id: "meta/llama-2-70b-chat",
    name: "Llama 2 70B",
    shortened: "70B",
  },
  {
    id: "yorickvp/llava-13b",
    name: "Llava 13B",
    shortened: "Llava",
  },
  {
    id: "nateraw/salmonn",
    name: "Salmonn",
    shortened: "Salmonn",
  },
];

const llamaTemplate = LlamaTemplate();

const generatePrompt = (template, systemPrompt, messages) => {
  const chat = messages.map((message) => ({
    role: message.isUser ? "user" : "assistant",
    content: message.text,
  }));

  return template([
    {
      role: "system",
      content: systemPrompt,
    },
    ...chat,
  ]);
};

function CTA({ shortenedModelName }) {
  if (shortenedModelName == "Llava") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Execute e ajuste Llava na nuvem.
      </a>
    );
  } else if (shortenedModelName == "Salmonn") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Execute e ajuste Salmonn na nuvem.
      </a>
    );
  } else {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Execute e ajuste Llama 2 na nuvem.
      </a>
    );
  }
}

const metricsReducer = (state, action) => {
  switch (action.type) {
    case "START":
      return { startedAt: new Date() };
    case "FIRST_MESSAGE":
      return { ...state, firstMessageAt: new Date() };
    case "COMPLETE":
      return { ...state, completedAt: new Date() };
    default:
      throw new Error(`Tipo de ação não suportado: ${action.type}`);
  }
};

export default function HomePage() {
  const MAX_TOKENS = 4096;
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  //   Parâmetros do Llama
  const [model, setModel] = useState(MODELS[2]); // padrão para 70B
  const [systemPrompt, setSystemPrompt] = useState(
    "Uma assistente de licenças ambientais do SEMADES RJ. Lembre-se de sempre responder em português br"
  );
  const [temp, setTemp] = useState(0.75);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(800);

  //  Parâmetros do Llava
  const [image, setImage] = useState(null);

  // Parâmetros do Salmonn
  const [audio, setAudio] = useState(null);

  const [metrics, dispatch] = useReducer(metricsReducer, {
    startedAt: null,
    firstMessageAt: null,
    completedAt: null,
  });

  const { complete, completion, setInput, input } = useCompletion({
    api: "/api",
    body: {
      model: model.id,
      systemPrompt: systemPrompt,
      temperature: parseFloat(temp),
      topP: parseFloat(topP),
      maxTokens: parseInt(maxTokens),
      image: image,
      audio: audio,
    },

    onError: (error) => {
      setError(error);
    },
    onResponse: (response) => {
      setStarting(false);
      setError(null);
      dispatch({ type: "FIRST_MESSAGE" });
    },
    onFinish: () => {
      dispatch({ type: "COMPLETE" });
    },
  });

  const handleFileUpload = (file) => {
    if (file) {
      // determine se o arquivo é uma imagem ou áudio
      if (
        ["audio/mpeg", "audio/wav", "audio/ogg"].includes(
          file.originalFile.mime
        )
      ) {
        setAudio(file.fileUrl);
        setModel(MODELS[4]);
        toast.success(
          "Você enviou um arquivo de áudio, então agora está conversando com Salmonn."
        );
      } else if (["image/jpeg", "image/png"].includes(file.originalFile.mime)) {
        setImage(file.fileUrl);
        setModel(MODELS[3]);
        toast.success(
          "Você enviou uma imagem, então agora está conversando com Llava."
        );
      } else {
        toast.error(
          `Desculpe, não suportamos esse tipo de arquivo (${file.originalFile.mime}) ainda. Sinta-se à vontade para enviar um PR para adicionar suporte a ele!`
        );
      }
    }
  };

  const setAndSubmitPrompt = (newPrompt) => {
    handleSubmit(newPrompt);
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setOpen(false);
    setSystemPrompt(event.target.systemPrompt.value);
  };

  const handleSubmit = async (userMessage) => {
    setStarting(true);
    const SNIP = "<!-- recortar -->";

    const messageHistory = [...messages];
    if (completion.length > 0) {
      messageHistory.push({
        text: completion,
        isUser: false,
      });
    }
    messageHistory.push({
      text: userMessage,
      isUser: true,
    });

    // Gerar prompt inicial e calcular tokens
    let prompt = `${generatePrompt(
      llamaTemplate,
      systemPrompt,
      messageHistory
    )}\n`;
    // Verificar se excedemos o limite de tokens e truncar o histórico de mensagens se for o caso.
    while (countTokens(prompt) > MAX_TOKENS) {
      if (messageHistory.length < 3) {
        setError(
          "Sua mensagem é muito longa. Por favor, tente novamente com uma mensagem mais curta."
        );

        return;
      }

      // Remover a terceira mensagem do histórico, mantendo a troca original.
      messageHistory.splice(1, 2);

      // Recriar o prompt
      prompt = `${SNIP}\n${generatePrompt(
        llamaTemplate,
        systemPrompt,
        messageHistory
      )}\n`;
    }

    setMessages(messageHistory);

    dispatch({ type: "START" });

    complete(prompt);
  };

  useEffect(() => {
    if (messages?.length > 0 || completion?.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, completion]);

  return (
    <>

      <nav className="grid grid-cols-2 pt-3 pl-6 pr-3 sm:grid-cols-3 sm:pl-0">
        <div className="hidden sm:inline-block"></div>
        <div className="font-semibold text-gray-500 sm:text-center">
          {model.shortened == "Llava"
            ? "🌋"
            : model.shortened == "Salmonn"
              ? "🐟"
              : "🦙"}{" "}
          <span className="hidden sm:inline-block">Chat usando</span>{" "}

          <button
            className="py-2 font-semibold text-gray-500 hover:underline"
            onClick={() => setOpen(true)}
          >
            {model.shortened == "Llava" || model.shortened == "Salmonn"
              ? model.shortened
              : "Llama 2 " + model.shortened}
          </button>
        </div>
        <div className="flex justify-end">
          <a
            className="inline-flex items-center px-3 py-2 mr-3 text-sm font-semibold text-black-700 bg-white rounded-md shadow-sm ring-1 ring-inset ring-black-700 hover:bg-black-100"
            href="https://luann8.github.io/LPP-1.3-usuarios/"
          >
            <CodeBracketIcon
              aria-hidden="true"
            />{" "}
            <span className="hidden sm:inline">Voltar</span>

          </a>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-black-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-black-300 hover:bg-black-100"
            onClick={() => setOpen(true)}
          >
            <Cog6ToothIcon
              className="w-5 h-5 text-black-500 sm:mr-2 group-hover:text-black-900"
              aria-hidden="true"
            />{" "}
          </button>
        </div>
      </nav>

      <Toaster position="top-left" reverseOrder={false} />

      <main className="max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        <div className="text-center"></div>
        {messages.length == 0 && !image && !audio && (
          <EmptyState setPrompt={setAndSubmitPrompt} setOpen={setOpen} />
        )}

        <SlideOver
          open={open}
          setOpen={setOpen}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          handleSubmit={handleSettingsSubmit}
          temp={temp}
          setTemp={setTemp}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          topP={topP}
          setTopP={setTopP}
          models={MODELS}
          size={model}
          setSize={setModel}
        />

        {image && (
          <div>
            <img src={image} className="mt-6 sm:rounded-xl" />
          </div>
        )}

        {audio && (
          <div>
            <audio controls src={audio} className="mt-6 sm:rounded-xl" />
          </div>
        )}

        <ChatForm
          prompt={input}
          setPrompt={setInput}
          onSubmit={handleSubmit}
          handleFileUpload={handleFileUpload}
          completion={completion}
          metrics={metrics}
        />

        {error && <div>{error}</div>}

        <article className="pb-24">
          {messages.map((message, index) => (
            <Message
              key={`message-${index}`}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          <Message message={completion} isUser={false} />

          {starting && <QueuedSpinner />}

          <div ref={bottomRef} />
        </article>
      </main>
    </>
  );
}
