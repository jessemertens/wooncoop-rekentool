function bereken() {
  const woningWaarde = parseFloat(document.getElementById("woningType").value);
  const instap = parseFloat(document.getElementById("instap").value);
  const opbouw = parseFloat(document.getElementById("opbouw").value);
  const jaar = parseInt(document.getElementById("jaar").value);

  const jaarLabel = document.getElementById("jaarLabel");
  const aandeelBeschrijving = document.getElementById("aandeelBeschrijving");
  const maandlastBeschrijving = document.getElementById("maandlastBeschrijving");

  if (instap < woningWaarde * 0.3) {
    alert("Het instapbedrag moet minstens 30% van de woningwaarde zijn.");
    resetResultaten();
    return;
  }

  if ((instap + opbouw) < woningWaarde * 0.65) {
    alert("Instapbedrag + opbouwbedrag moet minstens 65% van de woningwaarde zijn.");
    resetResultaten();
    return;
  }

  const par_woonkosten_tarief = 0.005;
  const par_gezondheidsindex = 0.02;
  const par_kapitaalopbouw_duur = 25;
  const par_kapitaalopbouw_intrestvoet = 0.02;
  const par_kapitaalopbouw_tarief = 0.0657;
  const par_zuiver_huren_tarief = 0.0324;

  const looptijd = par_kapitaalopbouw_duur * 12;
  const maandIndex = jaar * 12;

  const vasteKosten = ((woningWaarde * par_woonkosten_tarief) / 12) * Math.pow(1 + par_gezondheidsindex, jaar - 1);
  let aandeelopbouw = 0;
  let rente = 0;

  if (jaar <= par_kapitaalopbouw_duur && opbouw > 0) {
    const rentevoetMaand = par_kapitaalopbouw_intrestvoet / 12;
    let totaal = 0;
    for (let m = (jaar - 1) * 12 + 1; m <= jaar * 12; m++) {
      totaal += opbouw * rentevoetMaand * Math.pow(1 + rentevoetMaand, looptijd) /
                (Math.pow(1 + rentevoetMaand, looptijd) - 1);
    }
    aandeelopbouw = totaal;
    rente = Math.max(0, (opbouw * par_kapitaalopbouw_tarief / 12) - (aandeelopbouw / 12));
  }

  const zuiverHuren = ((woningWaarde - instap - opbouw) * par_zuiver_huren_tarief / 12) *
                      Math.pow(1 + par_gezondheidsindex, jaar - 1);

  const maandlast = vasteKosten + (aandeelopbouw / 12) + rente + zuiverHuren;
  const totaalAandeel = Math.min(instap + aandeelopbouw * jaar, woningWaarde);
  const aandeelPercentage = Math.round((totaalAandeel / woningWaarde) * 100);
  const restPercentage = 100 - aandeelPercentage;

  jaarLabel.innerText = jaar;
  aandeelBeschrijving.innerText = `Je bezit ${aandeelPercentage}% (€${totaalAandeel.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}) van de woning. 
  Je moet nog ${restPercentage}% (€${(woningWaarde - totaalAandeel).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}) aantal aandelen opbouwen.`;
  maandlastBeschrijving.innerText = `Totale maandlast: €${maandlast.toFixed(2).replace('.', ',')}`;

  if (aandeelPercentage >= 100) {
    document.querySelectorAll("input, select, button").forEach(el => el.disabled = true);
  }

  const ctx = document.getElementById("staafDiagram").getContext("2d");
  if (window.staaf) window.staaf.destroy();
  window.staaf = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Maandlast"],
      datasets: [
        {
          label: "Vaste kosten",
          data: [vasteKosten],
          backgroundColor: "#9dbcae"
        },
        {
          label: "Aandeelopbouw + Rente",
          data: [(aandeelopbouw / 12) + rente],
          backgroundColor: "#c0392b"
        },
        {
          label: "Deel zuiver huren",
          data: [zuiverHuren],
          backgroundColor: "#cccccc"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: €${ctx.raw.toFixed(2).replace('.', ',')}`
          }
        }
      },
      scales: {
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            callback: value => `€${value.toFixed(2).replace('.', ',')}`
          }
        },
        x: {
          stacked: true
        }
      }
    }
  });
}
