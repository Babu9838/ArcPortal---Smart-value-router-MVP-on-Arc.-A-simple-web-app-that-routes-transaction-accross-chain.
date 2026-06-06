const ARC_CHAIN = {
  chainId: "0x4CEDD2", // 5042002 hex এ convert করে ব্যবহার করো
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "ARC",
    symbol: "ARC",
    decimals: 18
  },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: []
};

let currentAccount = null;

const connectBtn = document.querySelector(".connect-btn");
const sendBtn = document.querySelector(".send-btn");

const walletCard =
  document.querySelector(".grid .card .value");

async function switchToArc() {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN.chainId }]
    });
  } catch (err) {
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARC_CHAIN]
      });
    }
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  try {
    await switchToArc();

    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAccount = accounts[0];

    walletCard.textContent =
      currentAccount.slice(0, 6) +
      "..." +
      currentAccount.slice(-4);

    connectBtn.textContent = "Connected";

    loadTransactions();

  } catch (err) {
    console.error(err);
  }
}

function saveTransaction(tx) {
  let history =
    JSON.parse(
      localStorage.getItem("arcTxs") || "[]"
    );

  history.unshift(tx);

  localStorage.setItem(
    "arcTxs",
    JSON.stringify(history)
  );

  renderTransactions();
}

function loadTransactions() {
  renderTransactions();
}

function renderTransactions() {
  const tbody =
    document.querySelector("tbody");

  tbody.innerHTML = "";

  const history =
    JSON.parse(
      localStorage.getItem("arcTxs") || "[]"
    );

  history.forEach(tx => {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${tx.hash}</td>
      <td>${tx.amount} USDC</td>
      <td class="success">${tx.status}</td>
    `;

    tbody.appendChild(row);
  });
}

function generateHash() {
  return (
    "0x" +
    Math.random()
      .toString(16)
      .substring(2) +
    Date.now()
      .toString(16)
  ).substring(0, 18);
}

async function sendUSDC() {

  if (!currentAccount) {
    alert("Connect wallet first");
    return;
  }

  const inputs =
    document.querySelectorAll("input");

  const receiver =
    inputs[0].value.trim();

  const amount =
    inputs[1].value.trim();

  if (!receiver || !amount) {
    alert("Fill all fields");
    return;
  }

  const tx = {
    hash: generateHash(),
    amount,
    status: "Success",
    timestamp: Date.now()
  };

  saveTransaction(tx);

  inputs[0].value = "";
  inputs[1].value = "";

  alert(
    `Demo Transfer Complete\n${amount} USDC`
  );
}

connectBtn.addEventListener(
  "click",
  connectWallet
);

sendBtn.addEventListener(
  "click",
  sendUSDC
);

if (window.ethereum) {

  ethereum.on(
    "accountsChanged",
    accounts => {

      if (!accounts.length) {

        currentAccount = null;

        walletCard.textContent =
          "Not Connected";

        connectBtn.textContent =
          "Connect Wallet";

      } else {

        currentAccount =
          accounts[0];

        walletCard.textContent =
          currentAccount.slice(0, 6) +
          "..." +
          currentAccount.slice(-4);
      }
    }
  );
}

loadTransactions();
