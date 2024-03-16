export default function EmptyState({ setOpen, setPrompt }) {
  return (
    <div className="mt-12 sm:mt-24 space-y-6 text-black text-base mx-8 sm:mx-4 sm:text-2xl leading-12 text-center">
      <p>
        Personalize a abordagem da IA de licenças ambientais clicando no botão{" "}
        <button
          className="prompt-button inline-flex items-center "
          onClick={() => setOpen(true)}
        >
          configurações
        </button>{" "}
        .
      </p>
      <p>
        A IA pode{" "}
        <button
          className="prompt-button"
          onClick={() =>
            setPrompt(
              "Explique o impacto da poluição do ar nas populações locais e como as regulamentações ambientais podem ajudar."
            )
          }
        >
          explicar conceitos
        </button>
        , redigir{" "}
        <button
          className="prompt-button"
          onClick={() =>
            setPrompt("Crie um relatório sobre os efeitos da extração de recursos naturais em áreas protegidas.")
          }
        >
          relatórios
        </button>{" "}
        e{" "}
        <button
          className="prompt-button"
          onClick={() =>
            setPrompt(
              "Desenvolva um algoritmo para prever o impacto ambiental de uma nova construção em uma área sensível."
            )
          }
        >
          código
        </button>
        ,{" "}
        <button
          className="prompt-button"
          onClick={() =>
            setPrompt(
              "Responda a esta pergunta: Como as mudanças climáticas afetam a biodiversidade em diferentes ecossistemas?"
            )
          }
        >
          analisar dados
        </button>
        , ou até mesmo{" "}
        <button
          className="prompt-button"
          onClick={() =>
            setPrompt(
              "Forneça sugestões para práticas de construção sustentável que minimizem o impacto ambiental."
            )
          }
        >
          oferecer recomendações.
        </button>{" "}
      </p>
      <p>Entre em contato para mais informações ou para iniciar uma avaliação de licença ambiental.</p>
    </div>
  );
}
