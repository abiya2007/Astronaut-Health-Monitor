// Astronaut Health Monitor - Main Telemetry Script with Theme Switcher

document.addEventListener('DOMContentLoaded', () => {

  // Default telemetry state
  const state = {
    theme: localStorage.getItem('theme') || 'dark',
    vitals: {
      heartRate: 72,      // bpm
      oxygen: 98,         // %
      temperature: 36.8,  // °C
      sleep: 7.5,         // hrs
      exercise: 55        // mins
    },
    history: {
      labels: [],
      heartRate: [],
      oxygen: []
    }
  };

  // DOM Elements
  const el = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    themeText: document.getElementById('themeText'),

    missionClock: document.getElementById('missionClock'),
    globalStatusPill: document.getElementById('globalStatusPill'),
    globalStatusText: document.getElementById('globalStatusText'),
    alertBanner: document.getElementById('alertBanner'),
    alertMessage: document.getElementById('alertMessage'),
    dismissAlertBtn: document.getElementById('dismissAlertBtn'),

    // Parameters
    valHeartRate: document.getElementById('valHeartRate'),
    tagHeartRate: document.getElementById('tagHeartRate'),
    barHeartRate: document.getElementById('barHeartRate'),
    cardHeartRate: document.getElementById('cardHeartRate'),

    valOxygen: document.getElementById('valOxygen'),
    tagOxygen: document.getElementById('tagOxygen'),
    barOxygen: document.getElementById('barOxygen'),
    cardOxygen: document.getElementById('cardOxygen'),

    valTemperature: document.getElementById('valTemperature'),
    tagTemperature: document.getElementById('tagTemperature'),
    barTemperature: document.getElementById('barTemperature'),
    cardTemperature: document.getElementById('cardTemperature'),

    valSleep: document.getElementById('valSleep'),
    tagSleep: document.getElementById('tagSleep'),

    valExercise: document.getElementById('valExercise'),
    tagExercise: document.getElementById('tagExercise'),

    // Controls
    btnPresetNormal: document.getElementById('btnPresetNormal'),
    btnPresetWarning: document.getElementById('btnPresetWarning'),
    btnPresetHypoxia: document.getElementById('btnPresetHypoxia'),

    sliderO2: document.getElementById('sliderO2'),
    sliderO2Val: document.getElementById('sliderO2Val'),
    sliderHR: document.getElementById('sliderHR'),
    sliderHRVal: document.getElementById('sliderHRVal'),
    sliderTemp: document.getElementById('sliderTemp'),
    sliderTempVal: document.getElementById('sliderTempVal')
  };

  // Setup Theme Switcher
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      el.themeIcon.textContent = '☀️';
      el.themeText.textContent = 'Light Mode';
    } else {
      el.themeIcon.textContent = '🌙';
      el.themeText.textContent = 'Dark Mode';
    }

    // Update Chart.js tick & grid colors
    if (telemetryChart) {
      const textColor = theme === 'dark' ? '#94a3b8' : '#475569';
      const gridColor = theme === 'dark' ? '#334155' : '#cbd5e1';
      const legendColor = theme === 'dark' ? '#f8fafc' : '#0f172a';

      telemetryChart.options.scales.x.ticks.color = textColor;
      telemetryChart.options.scales.x.grid.color = gridColor;
      telemetryChart.options.scales.y.ticks.color = textColor;
      telemetryChart.options.scales.y.grid.color = gridColor;
      telemetryChart.options.plugins.legend.labels.color = legendColor;
      telemetryChart.update();
    }
  }

  el.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Chart setup
  const chartCtx = document.getElementById('telemetryChart').getContext('2d');
  const telemetryChart = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Heart Rate (bpm)',
          data: [],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Oxygen SpO2 (%)',
          data: [],
          borderColor: '#10b981',
          borderDash: [4, 4],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#f8fafc' } }
      }
    }
  });

  // Apply initial theme
  applyTheme(state.theme);

  // Step 5: Mission Clock Counter
  let solDay = 42;
  let secondsCount = 14 * 3600 + 32 * 60 + 5;

  function updateClock() {
    secondsCount++;
    const hrs = String(Math.floor((secondsCount % 86400) / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsCount % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsCount % 60).padStart(2, '0');
    el.missionClock.textContent = `Sol ${solDay} • ${hrs}:${mins}:${secs}`;
  }
  setInterval(updateClock, 1000);

  // Evaluate Health Thresholds & Status
  function updateDashboard() {
    const v = state.vitals;

    // --- STEP 4 ALERT RULE: Oxygen < 90% -> CRITICAL ALERT ---
    let o2Status = 'normal';
    if (v.oxygen < 90) {
      o2Status = 'critical';
    } else if (v.oxygen < 95) {
      o2Status = 'warning';
    }

    // Heart Rate Status
    let hrStatus = 'normal';
    if (v.heartRate > 120 || v.heartRate < 45) {
      hrStatus = 'critical';
    } else if (v.heartRate > 100 || v.heartRate < 55) {
      hrStatus = 'warning';
    }

    // Temp Status
    let tempStatus = 'normal';
    if (v.temperature > 38.2 || v.temperature < 35.2) {
      tempStatus = 'critical';
    } else if (v.temperature > 37.5 || v.temperature < 36.2) {
      tempStatus = 'warning';
    }

    // Overall Global Status (Step 3)
    let globalStatus = 'normal';
    let alertMsg = '';

    if (o2Status === 'critical') {
      globalStatus = 'critical';
      alertMsg = `CRITICAL ALERT: Oxygen level is dangerously low at ${v.oxygen.toFixed(0)}% (< 90% threshold)!`;
    } else if (hrStatus === 'critical') {
      globalStatus = 'critical';
      alertMsg = `CRITICAL ALERT: Heart rate reading abnormal (${v.heartRate.toFixed(0)} bpm)!`;
    } else if (tempStatus === 'critical') {
      globalStatus = 'critical';
      alertMsg = `CRITICAL ALERT: Body temperature extreme (${v.temperature.toFixed(1)} °C)!`;
    } else if (o2Status === 'warning' || hrStatus === 'warning' || tempStatus === 'warning') {
      globalStatus = 'warning';
    }

    // Update Global Badge
    el.globalStatusPill.className = `status-pill status-${globalStatus}`;
    el.globalStatusText.textContent = globalStatus.charAt(0).toUpperCase() + globalStatus.slice(1);

    // Update Alert Banner (Step 4)
    if (globalStatus === 'critical') {
      el.alertBanner.classList.remove('hidden');
      el.alertMessage.textContent = alertMsg;
    } else {
      el.alertBanner.classList.add('hidden');
    }

    // Update Card Displays
    // 1. Heart Rate
    el.valHeartRate.textContent = Math.round(v.heartRate);
    updateCardElement(el.cardHeartRate, el.tagHeartRate, el.barHeartRate, hrStatus);
    el.barHeartRate.style.width = `${Math.min(100, Math.max(0, ((v.heartRate - 40) / 100) * 100))}%`;

    // 2. Oxygen Level
    el.valOxygen.textContent = Math.round(v.oxygen);
    updateCardElement(el.cardOxygen, el.tagOxygen, el.barOxygen, o2Status);
    el.barOxygen.style.width = `${v.oxygen}%`;

    // 3. Body Temperature
    el.valTemperature.textContent = v.temperature.toFixed(1);
    updateCardElement(el.cardTemperature, el.tagTemperature, el.barTemperature, tempStatus);
    el.barTemperature.style.width = `${Math.min(100, Math.max(0, ((v.temperature - 34) / 7) * 100))}%`;

    // 4. Sleep
    el.valSleep.textContent = v.sleep.toFixed(1);

    // 5. Exercise
    el.valExercise.textContent = Math.round(v.exercise);

    // Sync Controls
    el.sliderO2.value = v.oxygen;
    el.sliderO2Val.textContent = `${Math.round(v.oxygen)}%`;
    el.sliderHR.value = v.heartRate;
    el.sliderHRVal.textContent = `${Math.round(v.heartRate)} bpm`;
    el.sliderTemp.value = v.temperature;
    el.sliderTempVal.textContent = `${v.temperature.toFixed(1)} °C`;

    // Push Chart Data
    const timeLabel = new Date().toLocaleTimeString().slice(0, 5);
    state.history.labels.push(timeLabel);
    state.history.heartRate.push(v.heartRate);
    state.history.oxygen.push(v.oxygen);

    if (state.history.labels.length > 15) {
      state.history.labels.shift();
      state.history.heartRate.shift();
      state.history.oxygen.shift();
    }

    telemetryChart.data.labels = state.history.labels;
    telemetryChart.data.datasets[0].data = state.history.heartRate;
    telemetryChart.data.datasets[1].data = state.history.oxygen;
    telemetryChart.update('quiet');
  }

  function updateCardElement(card, tag, bar, status) {
    card.className = `vital-card ${status}`;
    tag.className = `status-tag ${status}`;
    tag.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    if (bar) bar.className = `range-fill ${status}`;
  }

  // Interactive Sliders
  el.sliderO2.addEventListener('input', (e) => {
    state.vitals.oxygen = parseFloat(e.target.value);
    updateDashboard();
  });

  el.sliderHR.addEventListener('input', (e) => {
    state.vitals.heartRate = parseFloat(e.target.value);
    updateDashboard();
  });

  el.sliderTemp.addEventListener('input', (e) => {
    state.vitals.temperature = parseFloat(e.target.value);
    updateDashboard();
  });

  // Scenario Presets
  el.btnPresetNormal.addEventListener('click', () => {
    state.vitals.oxygen = 98;
    state.vitals.heartRate = 72;
    state.vitals.temperature = 36.8;
    updateDashboard();
  });

  el.btnPresetWarning.addEventListener('click', () => {
    state.vitals.oxygen = 94;
    state.vitals.heartRate = 108;
    state.vitals.temperature = 37.8;
    updateDashboard();
  });

  el.btnPresetHypoxia.addEventListener('click', () => {
    state.vitals.oxygen = 87; // Trigger Step 4 Alert condition (< 90%)
    state.vitals.heartRate = 115;
    updateDashboard();
  });

  el.dismissAlertBtn.addEventListener('click', () => {
    el.alertBanner.classList.add('hidden');
  });

  // Minor fluctuations to simulate telemetry stream
  setInterval(() => {
    state.vitals.heartRate += (Math.random() - 0.5) * 1.2;
    state.vitals.heartRate = Math.min(150, Math.max(40, state.vitals.heartRate));
    updateDashboard();
  }, 3000);

  // Initial render
  updateDashboard();
});
