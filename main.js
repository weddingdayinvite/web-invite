function animateOnView() {
  const blocks = document.querySelectorAll('.block');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.intersectionRatio > 0.1);
    });
  }, {
    threshold: 0.1,
    rootMargin: '-5% 0px -5% 0px'
  });
  blocks.forEach(block => io.observe(block));
}

function startTimer() {
  const target = new Date('2025-10-25T09:00:00+03:00').getTime();
  const els = {
    days:    document.getElementById('days'),
    hours:   document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };
  function update() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    diff %= 86400000;
    const h = Math.floor(diff / 3600000);
    diff %= 3600000;
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.days.textContent    = d;
    els.hours.textContent   = h;
    els.minutes.textContent = m;
    els.seconds.textContent = s;
  }
  update();
  setInterval(update, 1000);
}

function setupForm() {
  const form = document.getElementById('rsvp-form');
  const ceremonyContainer = document.getElementById('ceremony-container');
  const additionalFields = document.getElementById('additional-fields');
  const sadDiv = document.getElementById('rsvp-sad');
  const successDiv = document.getElementById('rsvp-success');

  const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSe2sitb6tMSTUd3XyfMDR0MsGDSd594pAYfFNX2CuDuYpxgSg/formResponse';
  const fieldMap = {
    'guest-name': 'entry.1236258322',
    'is-coming' : 'entry.724427502',
    'ceremony'  : 'entry.270890438',
    'alcohol'   : 'entry.1323163526'
  };

  additionalFields.disabled = true;
  ceremonyContainer.classList.add('hidden');

  form.addEventListener('change', () => {
    const isComing = form.querySelector('input[name="is-coming"]:checked')?.value;
    if (isComing === 'Да') {
      additionalFields.disabled = false;
      ceremonyContainer.classList.remove('hidden');
      ceremonyContainer.querySelectorAll('input').forEach(i => i.required = true);
    } else {
      additionalFields.disabled = true;
      additionalFields.querySelectorAll('input').forEach(i => i.checked = false);
      ceremonyContainer.classList.add('hidden');
      ceremonyContainer.querySelectorAll('input').forEach(i => {
        i.checked = false;
        i.required = false; // ВАЖНО! Убираем required
      });
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const params = new URLSearchParams();

    params.append(fieldMap['guest-name'], fd.get('guest-name') || '');
    const coming = fd.get('is-coming') || '';
    params.append(fieldMap['is-coming'], coming);

    if (coming === 'Да') {
      const al = fd.getAll('alcohol');
      al.length ? al.forEach(v => params.append(fieldMap['alcohol'], v)) : params.append(fieldMap['alcohol'], '');
      params.append(fieldMap['ceremony'], fd.get('ceremony') || '');
      form.classList.add('hidden');
      successDiv.classList.remove('hidden');
      setTimeout(() => successDiv.style.opacity = '1', 50);
    } else {
      form.classList.add('hidden');
      sadDiv.classList.remove('hidden');
      setTimeout(() => sadDiv.style.opacity = '1', 50);
    }

    // В любом случае отправляем результат в Google Form!
    fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  animateOnView();
  startTimer();
  setupForm();
   // preloader logic
  const preloader = document.getElementById('preloader');
  const mediaElements = Array.from(document.images);
  // Если есть видео или аудио, добавьте их сюда:
  // mediaElements.push(...document.querySelectorAll('video, audio'));

  let loadedCount = 0;
  const totalMedia = mediaElements.length;

  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount >= totalMedia) {
      setTimeout(() => {
        preloader.classList.add('hide');
      }, 300); // небольшая задержка для плавности
    }
  }

  if (totalMedia === 0) {
    // Нет медиа — сразу скрываем
    preloader.classList.add('hide');
  } else {
    mediaElements.forEach(img => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
      }
    });
  }
});
