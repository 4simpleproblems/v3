window.addEventListener('DOMContentLoaded', (event) => {
    const gameGrid = document.querySelector('.game-grid');
    const gameButtons = Array.from(gameGrid.querySelectorAll('.game-button'));

    gameButtons.sort((a, b) => {
        const altA = a.querySelector('img') ? a.querySelector('img').alt : '';
        const altB = b.querySelector('img') ? b.querySelector('img').alt : '';
        return altA.localeCompare(altB);
    });

    gameButtons.forEach(button => gameGrid.appendChild(button));
});
