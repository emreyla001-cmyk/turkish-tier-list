// dev-auto.js – otomatik dev server başlat/kapama
// ----------------------------------------------------------
// Bu script, Next.js dev server'ını (npm run dev) başlatır,
// dosya değişikliklerini izler ve bir süre idle (değişiklik yok)
// kalırsa sunucuyu kapatır. Böylece localhost sadece geliştirme
// sırasında aktif kalır ve SSD alanı gereksiz doldurmaz.
// ----------------------------------------------------------

const { spawn } = require('child_process');
const chokidar = require('chokidar');

const projectRoot = process.cwd();
const idleTime = 5 * 60 * 1000; // 5 dk (istediğiniz gibi değiştirilebilir)

let devProcess = null;
let idleTimer = null;

function startDev() {
  if (devProcess) return;
  console.log('[dev-auto] Next.js dev server başlatılıyor...');
  devProcess = spawn('npm', ['run', 'dev'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  devProcess.on('exit', (code, signal) => {
    console.log(`[dev-auto] Dev server sonlandırıldı (code=${code}, signal=${signal})`);
    devProcess = null;
  });
}

function stopDev() {
  if (!devProcess) return;
  console.log('[dev-auto] Idle süresi doldu – dev server kapanıyor...');
  devProcess.kill('SIGINT');
  devProcess = null;
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(stopDev, idleTime);
}

// Başlangıçta dev server'ı çalıştır ve izleyiciyi kur
startDev();
resetIdleTimer();

const watcher = chokidar.watch(projectRoot, {
  ignored: /(?:node_modules|\.next|\.git|\.DS_Store)/,
  ignoreInitial: true,
  persistent: true,
});

watcher.on('all', (event, path) => {
  console.log(`[dev-auto] Değişiklik tespit edildi (${event}) -> ${path}`);
  if (!devProcess) startDev();
  resetIdleTimer();
});

process.on('SIGINT', () => {
  console.log('[dev-auto] Ctrl+C algılandı – temizleniyor...');
  watcher.close();
  stopDev();
  process.exit(0);
});
