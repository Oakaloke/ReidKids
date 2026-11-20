(async () => {
  const question = document.getElementById('daily-joke-question');
  const reveal = document.getElementById('daily-joke-reveal');
  const answer = document.getElementById('daily-joke-answer');
  if (!question || !reveal || !answer) return;

  try {
    // The Giggle Corner HTML is the source of truth, including without JavaScript.
    const response = await fetch('jokes.html');
    if (!response.ok) return;
    const library = new DOMParser().parseFromString(await response.text(), 'text/html');
    const jokes = [...library.querySelectorAll('.joke-card')]
      .map(card => ({
        question: card.querySelector('.joke-question')?.textContent.trim(),
        answer: card.querySelector('.joke-answer')?.textContent.trim()
      }))
      .filter(joke => joke.question && joke.answer);
    if (!jokes.length) return;

    // Count local calendar days in UTC to avoid skips/repeats at daylight-saving changes.
    const now = new Date();
    const day = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000;
    const index = ((day % jokes.length) + jokes.length) % jokes.length;
    question.textContent = jokes[index].question;
    answer.textContent = jokes[index].answer;
    question.hidden = false;
    reveal.hidden = false;
  } catch {
    // The visible Giggle Corner link still works if the daily joke cannot load.
  }
})();
