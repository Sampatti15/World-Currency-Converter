// ELEMENTS
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultText = document.getElementById("result");

const prevRateText = document.querySelector(".profit-card p:nth-child(2)");
const currRateText = document.querySelector(".profit-card p:nth-child(3)");
const profitLossText = document.getElementById("profitLoss");

const suggestionBox = document.querySelector(".alerts-card").previousElementSibling.querySelector("p");

const alertInput = document.querySelector(".alerts-card input");
const alertBtn = document.querySelector(".alerts-card button");
const alertMsg = document.querySelector(".alerts-card p");

// DROPDOWN FROM Countries.js
for (let currencyCode in countryList) {
    let option1 = document.createElement("option");
    option1.value = currencyCode;
    option1.textContent = currencyCode;
    fromSelect.appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = currencyCode;
    option2.textContent = currencyCode;
    toSelect.appendChild(option2);
}

fromSelect.value = "USD";
toSelect.value = "INR";

// GRAPH SETUP
const ctx = document.getElementById("rateChart").getContext("2d");

let rateHistory = [];
let timeLabels = [];

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [{
            label: "Exchange Rate",
            data: rateHistory,
            borderColor: "#2575fc",
            backgroundColor: "rgba(37,117,252,0.1)",
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false } }
    }
});

// LOGIC VARIABLES
let previousRate = null;
let alertValue = null;

// MAIN FUNCTION
async function convertCurrency() {
    let amount = amountInput.value;
    if (amount === "" || amount <= 0) {
        amount = 1;
        amountInput.value = 1;
    }

    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    try {
        const URL = ;
        const response = await fetch(URL);
        const data = await response.json();

        const rate = data.rates[toCurrency];
        const finalAmount = (amount * rate).toFixed(2);

        resultText.innerText = `${amount} ${fromCurrency} = ${finalAmount} ${toCurrency}`;

        // GRAPH
        const now = new Date().toLocaleTimeString();
        rateHistory.push(rate);
        timeLabels.push(now);

        if (rateHistory.length > 10) {
            rateHistory.shift();
            timeLabels.shift();
        }

        chart.update();

        // PROFIT LOSS 
        if (previousRate !== null) {
            const diff = (rate - previousRate).toFixed(4);

            prevRateText.innerText = "Previous Rate: " + previousRate;
            currRateText.innerText = "Current Rate: " + rate;

            if (diff > 0) {
                profitLossText.innerText = "Change: +" + diff + " 📈 Profit";
                profitLossText.style.color = "green";
                suggestionBox.innerText = "Rate rising. Waiting may give better return.";
            } else if (diff < 0) {
                profitLossText.innerText = "Change: " + diff + " 📉 Loss";
                profitLossText.style.color = "red";
                suggestionBox.innerText = "Rate dropped. Converting now could help.";
            } else {
                profitLossText.innerText = "No change";
                profitLossText.style.color = "black";
            }
        }

        previousRate = rate;

        // ALERT 
        if (alertValue !== null && rate >= alertValue) {
            alertMsg.innerText = "🚨 Alert! Rate reached " + rate;
        }

    } catch (error) {
        resultText.innerText = "Error fetching rate";
        console.error(error);
    }
}

// EVENTS
convertBtn.addEventListener("click", convertCurrency);

alertBtn.addEventListener("click", () => {
    alertValue = alertInput.value;
    alertMsg.innerText = "Alert set at " + alertValue;
});

// Auto refresh every 10 seconds
setInterval(convertCurrency, 10000);

// Run on page load
window.addEventListener("load", convertCurrency);
