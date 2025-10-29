 <script>
    // set year
    document.getElementById('year').textContent = new Date().getFullYear();

    // generate simple visual chessboard (nur Platzhalter) — ersetzt werden durch echte Bibliothek
    const board = document.getElementById('board');
    const files = ['a','b','c','d','e','f','g','h'];
    for(let r=8;r>=1;r--){
      for(let f=0;f<8;f++){
        const sq = document.createElement('div');
        const isLight = (r + f) % 2 === 0;
        sq.className = 'square ' + (isLight ? 'light':'dark');
        sq.dataset.square = files[f]+r;
        sq.title = files[f]+r;
        // minimal click handler for demo
        sq.addEventListener('click', ()=>{
          sq.style.outline = '3px solid rgba(255,255,255,0.12)';
          setTimeout(()=> sq.style.outline = '',400);
        });
        board.appendChild(sq);
      }
    }

    // small helpers: simulate progress change
    function setProgress(percent){
      const bar = document.querySelector('.progress > i');
      bar.style.width = Math.max(0,Math.min(100,percent)) + '%';
    }
    setProgress(42);

    // placeholder for integration hooks
    window.SchachLern = {
      setLevel: lvl => document.getElementById('level').textContent = lvl,
      setPoints: pts => document.getElementById('points').textContent = pts,
      setProgress
    };

    // Example usage (development)
    // window.SchachLern.setLevel('A2');
    // window.SchachLern.setPoints(410);
    // window.SchachLern.setProgress(62);
  </script>
