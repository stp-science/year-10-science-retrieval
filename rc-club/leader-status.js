import './week3-trial.js';

const leaderCard = document.getElementById('leaderCard');
const standingsBody = document.getElementById('standingsBody');

function correctLeaderStatus() {
  if (!leaderCard || !standingsBody) return;

  const totals = [...standingsBody.querySelectorAll('.total-points')]
    .map((cell) => Number(cell.textContent.trim()))
    .filter(Number.isFinite);

  if (!totals.length) return;

  const noPointsAwarded = totals.every((total) => total === 0);

  if (noPointsAwarded) {
    const waitingMarkup = '<strong>🏁 Championship not started</strong><span>No points have been awarded yet.</span>';
    if (leaderCard.innerHTML !== waitingMarkup) leaderCard.innerHTML = waitingMarkup;
  }
}

const observer = new MutationObserver(correctLeaderStatus);
observer.observe(standingsBody, { childList: true, subtree: true, characterData: true });
observer.observe(leaderCard, { childList: true, subtree: true, characterData: true });
correctLeaderStatus();
