(function () {
  "use strict";

  /* ================= storage ================= */
  const KEYS = {
    vehicles: "evshowroom.vehicles",
    sales: "evshowroom.sales",
    expenses: "evshowroom.expenses",
    settings: "evshowroom.settings",
    theme: "evshowroom.theme",
    dataVersion: "evshowroom.dataVersion",
    business: "evshowroom.business",
    invoices: "evshowroom.invoices",
  };
  const CURRENT_SEED_VERSION = "4"; // bump to apply a new one-time data migration on next load

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  let vehicles = load(KEYS.vehicles, []);
  let sales = load(KEYS.sales, []);
  let expenses = load(KEYS.expenses, []);
  let settings = load(KEYS.settings, { currency: "₹" });
  let invoices = load(KEYS.invoices, []);
  let business = load(KEYS.business, {
    name: "",
    tagline: "Electric Scooty Sales, Service & Spare Parts.",
    gstin: "",
    address: "",
    state: "",
    mobile: "",
    email: "",
    hsnCode: "8711",
    gstRate: 5,
    invoicePrefix: "INV",
    nextInvoiceNo: 1,
    warrantyTerms:
      "WARRANTY Company Rules & Regulation.\n" +
      "Goods once sold are not returnable.\n" +
      "The graphene battery / lead acid battery comes with a 1-year warranty.\n" +
      "It may take 15 days for resolved the motor, battery and controller issue.\n" +
      "The warranty does not cover swollen or burst batteries.\n" +
      "The warranty is void if the motor and controller burn out.",
  });

  function persist() {
    save(KEYS.vehicles, vehicles);
    save(KEYS.sales, sales);
    save(KEYS.expenses, expenses);
    save(KEYS.settings, settings);
    save(KEYS.invoices, invoices);
    save(KEYS.business, business);
  }

  /* ================= starting inventory & one-time data migrations ================= */
  function applySeedIfVersionMismatch() {
    const storedVersion = load(KEYS.dataVersion, null);
    if (storedVersion === CURRENT_SEED_VERSION) return;

    const today = todayISO();
    const ZELIO = "Zelio E-Vehicles";
    const CHINA = "Chinese Import";

    // v2: replaces whatever is stored with the real current stock (11 vehicles)
    if (storedVersion !== "2") {
      vehicles = [
        { id: "veh1", model: "Zelio Eco ZX", variant: "Unit 1", reg: "", purchaseDate: today, purchasePrice: 52000, expectedSalePrice: 65000, supplier: ZELIO, notes: "", status: "in_stock" },
        { id: "veh2", model: "Zelio Eco ZX", variant: "Unit 2", reg: "", purchaseDate: today, purchasePrice: 52000, expectedSalePrice: 65000, supplier: ZELIO, notes: "", status: "in_stock" },
        { id: "veh3", model: "Zelio Eva", variant: "", reg: "", purchaseDate: today, purchasePrice: 54000, expectedSalePrice: 70000, supplier: ZELIO, notes: "", status: "in_stock" },
        { id: "veh4", model: "Zelio Gracy Plus", variant: "", reg: "", purchaseDate: today, purchasePrice: 56000, expectedSalePrice: 75000, supplier: ZELIO, notes: "", status: "in_stock" },
        { id: "veh5", model: "Zelio Eva ZX", variant: "", reg: "", purchaseDate: today, purchasePrice: 65000, expectedSalePrice: 89000, supplier: ZELIO, notes: "", status: "in_stock" },
        { id: "veh6", model: "Chinese E-Scooter #1", variant: "", reg: "", purchaseDate: today, purchasePrice: 44000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
        { id: "veh7", model: "Chinese E-Scooter #2", variant: "", reg: "", purchaseDate: today, purchasePrice: 45000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
        { id: "veh8", model: "Chinese E-Scooter #3", variant: "", reg: "", purchaseDate: today, purchasePrice: 44000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
        { id: "veh9", model: "Chinese E-Scooter #4", variant: "", reg: "", purchaseDate: today, purchasePrice: 45000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
        { id: "veh10", model: "Chinese E-Scooter #5", variant: "", reg: "", purchaseDate: today, purchasePrice: 44000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
        { id: "veh11", model: "Chinese E-Scooter #6", variant: "", reg: "", purchaseDate: today, purchasePrice: 45000, expectedSalePrice: null, supplier: CHINA, notes: "Selling price to be added", status: "in_stock" },
      ];
      sales = [];
      expenses = [];
    }

    // v3: adds 8 vehicles already sold in August (kept separate from the 11 current-stock
    // units above) — appended on top of whatever is already stored, never replacing it.
    const augustSoldVehicles = [
      { id: "veh-aug1", model: "Zelio Gracy", variant: "Unit 1", reg: "", purchaseDate: "2026-07-05", purchasePrice: 56000, expectedSalePrice: 75000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug2", model: "Zelio Gracy", variant: "Unit 2", reg: "", purchaseDate: "2026-07-08", purchasePrice: 56000, expectedSalePrice: 75000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug3", model: "Zelio Gracy", variant: "Unit 3", reg: "", purchaseDate: "2026-07-12", purchasePrice: 56000, expectedSalePrice: 75000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug4", model: "Zelio Eva ZX", variant: "Unit 1", reg: "", purchaseDate: "2026-07-15", purchasePrice: 65000, expectedSalePrice: 89000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug5", model: "Zelio Eva ZX", variant: "Unit 2", reg: "", purchaseDate: "2026-07-18", purchasePrice: 65000, expectedSalePrice: 89000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug6", model: "Zelio Eva", variant: "", reg: "", purchaseDate: "2026-07-20", purchasePrice: 54000, expectedSalePrice: 70000, supplier: ZELIO, notes: "", status: "sold" },
      { id: "veh-aug7", model: "Zelio Eva LX", variant: "", reg: "", purchaseDate: "2026-07-22", purchasePrice: 58000, expectedSalePrice: 76000, supplier: ZELIO, notes: "Estimated buy/sell price — confirm and correct if different", status: "sold" },
      { id: "veh-aug8", model: "Z Man", variant: "", reg: "", purchaseDate: "2026-07-25", purchasePrice: 50000, expectedSalePrice: 64000, supplier: "Unconfirmed brand", notes: "Estimated price and brand — confirm and correct if different", status: "sold" },
    ];
    const augustSales = [
      { id: "sale-aug1", vehicleId: "veh-aug1", saleDate: "2026-08-03", salePrice: 75000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug2", vehicleId: "veh-aug2", saleDate: "2026-08-08", salePrice: 75000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug3", vehicleId: "veh-aug3", saleDate: "2026-08-14", salePrice: 75000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug4", vehicleId: "veh-aug4", saleDate: "2026-08-18", salePrice: 89000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug5", vehicleId: "veh-aug5", saleDate: "2026-08-22", salePrice: 89000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug6", vehicleId: "veh-aug6", saleDate: "2026-08-25", salePrice: 70000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug7", vehicleId: "veh-aug7", saleDate: "2026-08-27", salePrice: 76000, buyer: "", contact: "", notes: "" },
      { id: "sale-aug8", vehicleId: "veh-aug8", saleDate: "2026-08-29", salePrice: 64000, buyer: "", contact: "", notes: "" },
    ];
    if (!vehicles.some((v) => v.id === "veh-aug1")) {
      vehicles = vehicles.concat(augustSoldVehicles);
      sales = sales.concat(augustSales);
    }

    // v4: sample GST invoice for one Gracy sale, so GST Billing has a real example on
    // first visit — fill in your business/buyer details later and it stays editable
    if (!invoices.some((i) => i.saleId === "sale-aug1")) {
      const gstRate = Number(business.gstRate || 5);
      const gst = computeGst(75000, gstRate, false);
      invoices.push({
        id: "inv-sample-gracy1",
        invoiceNo: nextInvoiceNumber("2026-08-03"),
        date: "2026-08-03",
        saleId: "sale-aug1",
        vehicleId: "veh-aug1",
        vehicleLabel: "Zelio Gracy – Unit 1",
        hsnCode: business.hsnCode || "8711",
        buyerName: "",
        buyerAddress: "",
        buyerMobile: "",
        buyerEmail: "",
        buyerGstin: "",
        buyerState: "",
        interState: false,
        gstRate,
        taxableValue: gst.taxableValue,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        total: gst.total,
      });
      business.nextInvoiceNo = Number(business.nextInvoiceNo || 1) + 1;
    }

    persist();
    save(KEYS.dataVersion, CURRENT_SEED_VERSION);
  }
  applySeedIfVersionMismatch();

  /* ================= icon library ================= */
  const ICONS = {
    car: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="2.5" y="11" width="19" height="6" rx="2"/><circle cx="7" cy="17.3" r="1.6"/><circle cx="17" cy="17.3" r="1.6"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    tag: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    box: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    bag: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    trending: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    receipt: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    award: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><polyline points="8.5 13.5 7 22 12 19 17 22 15.5 13.5"/></svg>',
    arrowRight: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="11"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    card: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    printer: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    eye: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  };

  /* ================= helpers ================= */
  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function toLocalISODate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function todayISO() {
    return toLocalISODate(new Date());
  }

  function formatMoney(n) {
    const v = Math.round(n || 0);
    const sign = v < 0 ? "-" : "";
    return sign + settings.currency + Math.abs(v).toLocaleString("en-IN");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  function getVehicle(id) {
    return vehicles.find((v) => v.id === id);
  }

  function vehicleLabel(v) {
    if (!v) return "—";
    return [v.model, v.variant].filter(Boolean).join(" – ");
  }

  function expensesForVehicle(vehicleId) {
    return expenses.filter((e) => e.vehicleId === vehicleId).reduce((s, e) => s + Number(e.amount || 0), 0);
  }

  function saleProfit(sale) {
    const v = getVehicle(sale.vehicleId);
    const purchase = v ? Number(v.purchasePrice || 0) : 0;
    const vExp = v ? expensesForVehicle(v.id) : 0;
    return Number(sale.salePrice || 0) - purchase - vExp;
  }

  /* ================= month / stock-flow calculations ================= */
  function addDaysISO(iso, delta) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + delta);
    return toLocalISODate(d);
  }

  function monthBounds(monthKey) {
    const [y, m] = monthKey.split("-").map(Number);
    const start = monthKey + "-01";
    const end = toLocalISODate(new Date(y, m, 0));
    return { start, end };
  }

  function monthLabel(monthKey) {
    const [y, m] = monthKey.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  // vehicles physically in stock as of a given date (purchased on/before it, not yet sold on/before it)
  function stockAsOf(dateISO) {
    return vehicles.filter((v) => {
      if (!v.purchaseDate || v.purchaseDate > dateISO) return false;
      const sale = sales.find((s) => s.vehicleId === v.id);
      if (!sale) return true;
      return sale.saleDate > dateISO;
    }).length;
  }

  // the most recent month that actually has activity, so the dashboard always
  // features real numbers instead of an empty "today" bucket
  function latestActiveMonthKey() {
    // months with real sales/expense activity take priority over months that only
    // have inventory purchases, so a fresh batch of stock doesn't bump a busier
    // sales month off the dashboard
    const transactionKeys = []
      .concat(sales.map((s) => s.saleDate))
      .concat(expenses.map((e) => e.date))
      .filter(Boolean)
      .map((d) => d.slice(0, 7));
    if (transactionKeys.length) return transactionKeys.sort().pop();

    const purchaseKeys = vehicles.map((v) => v.purchaseDate).filter(Boolean).map((d) => d.slice(0, 7));
    if (purchaseKeys.length) return purchaseKeys.sort().pop();

    return todayISO().slice(0, 7);
  }

  function computeMonthSummary(monthKey) {
    const { start, end } = monthBounds(monthKey);
    const purchasedList = vehicles.filter((v) => v.purchaseDate >= start && v.purchaseDate <= end);
    const soldList = sales.filter((s) => s.saleDate >= start && s.saleDate <= end);
    const expensesList = expenses.filter((e) => e.date >= start && e.date <= end);

    const opening = stockAsOf(addDaysISO(start, -1));
    const closing = stockAsOf(end);
    const revenue = soldList.reduce((s, x) => s + Number(x.salePrice || 0), 0);
    const purchaseCostOfSold = soldList.reduce((s, x) => {
      const v = getVehicle(x.vehicleId);
      return s + (v ? Number(v.purchasePrice || 0) : 0);
    }, 0);
    const purchaseCostOfPurchased = purchasedList.reduce((s, v) => s + Number(v.purchasePrice || 0), 0);
    const expensesTotal = expensesList.reduce((s, e) => s + Number(e.amount || 0), 0);
    const profit = revenue - purchaseCostOfSold - expensesTotal;

    return {
      monthKey,
      label: monthLabel(monthKey),
      start,
      end,
      opening,
      closing,
      purchasedList,
      soldList,
      expensesList,
      revenue,
      purchaseCostOfSold,
      purchaseCostOfPurchased,
      expensesTotal,
      profit,
    };
  }

  /* ================= GST billing ================= */
  function financialYearLabel(dateISO) {
    const d = new Date((dateISO || todayISO()) + "T00:00:00");
    const y = d.getFullYear();
    const startYear = d.getMonth() + 1 >= 4 ? y : y - 1; // Indian FY starts 1 April
    return startYear + "-" + String((startYear + 1) % 100).padStart(2, "0");
  }

  function nextInvoiceNumber(dateISO) {
    const seq = String(business.nextInvoiceNo || 1).padStart(4, "0");
    return (business.invoicePrefix || "INV") + "/" + financialYearLabel(dateISO) + "/" + seq;
  }

  // amount is treated as GST-inclusive (what the customer actually pays); this
  // backs out the taxable value and splits the tax as CGST+SGST (intra-state)
  // or IGST (inter-state)
  function computeGst(amount, gstRatePct, interState) {
    const rate = Number(gstRatePct || 0);
    const taxableValue = Math.round((amount / (1 + rate / 100)) * 100) / 100;
    const gstAmount = Math.round((amount - taxableValue) * 100) / 100;
    const cgst = interState ? 0 : Math.round((gstAmount / 2) * 100) / 100;
    const sgst = interState ? 0 : Math.round((gstAmount / 2) * 100) / 100;
    const igst = interState ? gstAmount : 0;
    return { taxableValue, gstAmount, cgst, sgst, igst, total: amount };
  }

  function invoiceForSale(saleId) {
    return invoices.find((i) => i.saleId === saleId);
  }

  /* ---------- Indian-format amount in words ---------- */
  function numberToWordsIndian(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function twoDigits(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }
    function threeDigits(n) {
      if (n >= 100) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
      return twoDigits(n);
    }
    if (num === 0) return "Zero";
    let crore = Math.floor(num / 10000000); num %= 10000000;
    let lakh = Math.floor(num / 100000); num %= 100000;
    let thousand = Math.floor(num / 1000); num %= 1000;
    const parts = [];
    if (crore) parts.push(threeDigits(crore) + " Crore");
    if (lakh) parts.push(threeDigits(lakh) + " Lakh");
    if (thousand) parts.push(threeDigits(thousand) + " Thousand");
    if (num) parts.push(threeDigits(num));
    return parts.join(" ");
  }

  function amountInWords(amount) {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let words = "Rupees " + numberToWordsIndian(rupees);
    if (paise) words += " and " + numberToWordsIndian(paise) + " Paise";
    return words + " Only";
  }

  /* ---------- printable tax invoice (dealer DMS style) ---------- */
  function ddmmyy(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getFullYear()).slice(2);
  }

  // customer-bill layout modeled on a physical carbon-copy receipt-book bill
  function buildInvoiceHtml(inv) {
    const v = getVehicle(inv.vehicleId) || {};
    const gstAmount = inv.interState ? inv.igst : inv.cgst + inv.sgst;
    const roundOff = Math.round((inv.total - (inv.taxableValue + gstAmount)) * 100) / 100;
    const taxRows = inv.interState
      ? "<tr><td>Add IGST %</td><td class='num'>" + formatMoney(inv.igst) + "</td></tr>"
      : "<tr><td>Add CGST %</td><td class='num'>" + formatMoney(inv.cgst) + "</td></tr>" +
        "<tr><td>Add SGST %</td><td class='num'>" + formatMoney(inv.sgst) + "</td></tr>";

    const batteryLines = (v.batteryNumbers || "").split("\n").map((s) => s.trim()).filter(Boolean);
    let descLines = "<div class='desc-line'><b>Model Name -</b> " + escapeHtml(inv.vehicleLabel) + "</div>";
    if (v.colour) descLines += "<div class='desc-line'><b>Colour -</b> " + escapeHtml(v.colour) + "</div>";
    if (v.controllerNo) descLines += "<div class='desc-line'><b>Controller No.-</b> " + escapeHtml(v.controllerNo) + "</div>";
    if (v.motorNo) descLines += "<div class='desc-line'><b>Motor No.-</b> " + escapeHtml(v.motorNo) + "</div>";
    if (v.chassisNo) descLines += "<div class='desc-line'><b>Chasis No.-</b> " + escapeHtml(v.chassisNo) + "</div>";
    if (v.chargerNo) descLines += "<div class='desc-line'><b>Charger No.-</b> " + escapeHtml(v.chargerNo) + "</div>";
    if (v.batteryCompany) descLines += "<div class='desc-line'><b>Battery Company Name -</b> " + escapeHtml(v.batteryCompany) + "</div>";
    if (batteryLines.length) {
      descLines += "<div class='desc-line'><b>Battery No.</b></div>";
      batteryLines.forEach((b, i) => { descLines += "<div class='desc-line battery-num'>" + (i + 1) + ". " + escapeHtml(b) + "</div>"; });
    }

    const warrantyItems = (business.warrantyTerms || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const warrantyHtml = warrantyItems.map((line) => "<li>" + escapeHtml(line) + "</li>").join("");

    return (
      "<!doctype html><html><head><meta charset='utf-8'><title>" + escapeHtml(inv.invoiceNo) + "</title>" +
      "<style>" +
      "*{box-sizing:border-box;}" +
      "body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;font-size:12px;max-width:720px;margin:20px auto;padding:0 14px;}" +
      "table{width:100%;border-collapse:collapse;}" +
      "td,th{border:1px solid #8a2331;padding:5px 8px;text-align:left;vertical-align:top;font-size:12px;}" +
      ".num{text-align:right;}" +

      ".headband{background:#f7ecd6;border:2px solid #8a2331;border-bottom:none;padding:8px 12px 0;}" +
      ".headtop{display:flex;justify-content:space-between;font-size:11px;font-weight:700;}" +
      ".headtop .no{color:#c81e2c;}" +
      ".logo-row{display:flex;align-items:center;justify-content:center;gap:10px;padding:2px 0 6px;}" +
      ".logo-row svg{flex-shrink:0;}" +
      ".logo-word{font-size:30px;font-weight:800;letter-spacing:.01em;line-height:1;}" +
      ".logo-word .m{color:#c81e2c;}" +
      ".logo-word .ev{color:#1955a8;}" +
      ".tagline{background:#1f7a3d;color:#fff;text-align:center;font-size:12px;font-weight:700;padding:4px;margin:0 -12px;}" +
      ".addr{display:flex;align-items:center;gap:6px;justify-content:center;font-size:11.5px;font-weight:700;padding:6px 0 2px;}" +
      ".gstline{text-align:center;font-size:11.5px;font-weight:700;padding:2px 0 8px;}" +

      ".custbox{border:2px solid #8a2331;border-top:none;padding:8px 12px;font-size:12.5px;}" +
      ".custbox .r{display:flex;gap:18px;margin:3px 0;}" +
      ".blank{border-bottom:1px dotted #444;padding:0 4px;display:inline-block;min-width:60px;}" +
      ".blank.grow{flex:1;}" +

      "table.items th{background:#1955a8;color:#fff;font-weight:700;border-color:#8a2331;}" +
      "table.items{border:2px solid #8a2331;border-top:none;border-collapse:collapse;}" +
      "table.items td{border-color:#8a2331;}" +
      ".desc-line{line-height:1.55;}" +
      ".battery-num{padding-left:14px;}" +
      ".amount-cell{font-size:15px;font-weight:800;text-align:right;}" +

      ".bottomrow{display:flex;gap:0;border:2px solid #8a2331;border-top:none;}" +
      ".words-box{flex:1.4;padding:10px 12px;font-size:12.5px;border-right:2px solid #8a2331;}" +
      ".words-box .amt{font-weight:700;}" +
      ".totals-box{flex:1;}" +
      ".totals-box table{border:none;}" +
      ".totals-box td{border:none;border-bottom:1px solid #d9b98f;font-size:12.5px;}" +
      ".totals-box tr.total td{border-top:2px solid #8a2331;border-bottom:none;font-weight:800;font-size:14px;padding-top:7px;}" +
      ".eoe{text-align:right;font-size:10.5px;color:#555;padding:2px 8px 0;}" +

      ".footrow{display:flex;justify-content:space-between;align-items:flex-end;margin-top:26px;gap:20px;}" +
      ".sig-line{border-top:1px solid #000;margin-top:34px;width:170px;font-size:11px;text-align:center;padding-top:3px;}" +
      ".forbox{text-align:center;}" +
      ".forbox .label{font-size:12px;font-weight:700;margin-bottom:4px;}" +

      ".warranty{margin-top:18px;font-size:9.5px;color:#333;}" +
      ".warranty ul{margin:4px 0 0;padding-left:16px;}" +
      ".warranty li{margin-bottom:2px;}" +

      "@media print{.noprint{display:none;}body{margin:0 auto;}}" +
      "</style></head><body>" +

      "<div class='headband'>" +
      "<div class='headtop'><span class='no'>No.- " + escapeHtml(inv.receiptNo || inv.invoiceNo) + "</span><span>Mob.- " + escapeHtml(business.mobile || "—") + "</span></div>" +
      "<div class='logo-row'>" +
      "<svg viewBox='0 0 100 100' width='46' height='46'><defs><linearGradient id='g" + inv.id + "' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#2a78d6'/><stop offset='100%' stop-color='#4a3aa7'/></linearGradient></defs><polygon points='50,4 91,27 91,73 50,96 9,73 9,27' fill='url(#g" + inv.id + ")'/><polygon points='58,20 34,56 48,56 42,82 68,44 53,44 58,20' fill='#fff'/></svg>" +
      "<div class='logo-word'><span class='m'>MASTER</span><span class='ev'>.EV</span></div>" +
      "</div>" +
      "<div class='tagline'>" + escapeHtml(business.tagline || "Electric Scooty Sales, Service &amp; Spare Parts.") + "</div>" +
      "<div class='addr'>📍 " + escapeHtml(business.address || "Address not set") + "</div>" +
      "<div class='gstline'>GST IN : " + escapeHtml(business.gstin || "—") + "</div>" +
      "</div>" +

      "<div class='custbox'>" +
      "<div class='r'>Name <span class='blank grow'>" + escapeHtml(inv.buyerName || "") + "</span></div>" +
      "<div class='r'>Address <span class='blank grow'>" + escapeHtml(inv.buyerAddress || "") + "</span> Mobile No. <span class='blank'>" + escapeHtml(inv.buyerMobile || "") + "</span></div>" +
      "<div class='r'>GST No. <span class='blank grow'>" + escapeHtml(inv.buyerGstin || "") + "</span> Date <span class='blank'>" + ddmmyy(inv.date) + "</span></div>" +
      "</div>" +

      "<table class='items'><thead><tr>" +
      "<th style='width:58%'>Discription</th><th class='num' style='width:12%'>Qnty.</th><th class='num' style='width:14%'>Rate</th><th class='num' style='width:16%'>Amount</th>" +
      "</tr></thead><tbody><tr>" +
      "<td>" + descLines + "</td>" +
      "<td class='num'>1</td>" +
      "<td class='num'>" + formatMoney(inv.taxableValue) + "</td>" +
      "<td class='amount-cell'>" + formatMoney(inv.total) + "</td>" +
      "</tr></tbody></table>" +

      "<div class='bottomrow'>" +
      "<div class='words-box'>Rupees <span class='amt'>" + escapeHtml(amountInWords(inv.total).replace(/^Rupees /, "")) + "</span></div>" +
      "<div class='totals-box'><table>" +
      "<tr><td>Item Value</td><td class='num'>" + formatMoney(inv.taxableValue) + "</td></tr>" +
      taxRows +
      "<tr><td>Round off Sale</td><td class='num'>" + (Math.round(roundOff) ? formatMoney(roundOff) : "") + "</td></tr>" +
      "<tr class='total'><td>TOTAL</td><td class='num'>" + formatMoney(inv.total) + "/-</td></tr>" +
      "</table><div class='eoe'>E. &amp; O. E.</div></div>" +
      "</div>" +

      "<div class='footrow'>" +
      "<div><div class='sig-line'>Customer Signature</div></div>" +
      "<div class='forbox'>" +
      "<div class='label'>For, Master.EV</div>" +
      "<svg viewBox='0 0 140 140' width='90' height='90'>" +
      "<defs><path id='circletop" + inv.id + "' d='M 20,70 A 50,50 0 0 1 120,70'/><path id='circlebot" + inv.id + "' d='M 120,70 A 50,50 0 0 1 20,70'/></defs>" +
      "<circle cx='70' cy='70' r='58' fill='none' stroke='#8a2331' stroke-width='2'/>" +
      "<circle cx='70' cy='70' r='50' fill='none' stroke='#8a2331' stroke-width='1'/>" +
      "<text font-size='11' font-weight='700' fill='#8a2331'><textPath href='#circletop" + inv.id + "' startOffset='50%' text-anchor='middle'>MASTER.EV</textPath></text>" +
      "<text font-size='8' fill='#8a2331'><textPath href='#circlebot" + inv.id + "' startOffset='50%' text-anchor='middle'>" + escapeHtml((business.address || "").slice(0, 40)) + "</textPath></text>" +
      "<text x='70' y='75' font-size='13' text-anchor='middle' fill='#8a2331'>★</text>" +
      "</svg>" +
      "</div>" +
      "</div>" +

      "<div class='warranty'><ul>" + warrantyHtml + "</ul></div>" +

      "<div class='noprint' style='margin-top:22px;text-align:center;'><button onclick='window.print()' style='font-size:14px;padding:10px 20px;cursor:pointer;'>Print / Save as PDF</button></div>" +
      "</body></html>"
    );
  }

  function printInvoice(invoiceId) {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const win = window.open("", "_blank", "width=820,height=1000");
    if (!win) {
      toast("Please allow pop-ups to view/print the invoice");
      return;
    }
    win.document.open();
    win.document.write(buildInvoiceHtml(inv));
    win.document.close();
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 2200);
  }

  /* ================= tabs ================= */
  const navItems = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".tab-panel");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      panels.forEach((p) => p.classList.toggle("hidden", p.id !== "tab-" + tab));
      renderAll();
    });
  });

  /* ================= theme ================= */
  const root = document.documentElement;
  const savedTheme = load(KEYS.theme, null);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    save(KEYS.theme, next);
  });

  const currencyInput = document.getElementById("settings-currency");
  currencyInput.value = settings.currency;
  currencyInput.addEventListener("input", () => {
    settings.currency = currencyInput.value || "₹";
    persist();
    renderAll();
  });

  /* ================= business & GST settings ================= */
  const bizFields = {
    name: document.getElementById("biz-name"),
    tagline: document.getElementById("biz-tagline"),
    gstin: document.getElementById("biz-gstin"),
    address: document.getElementById("biz-address"),
    state: document.getElementById("biz-state"),
    mobile: document.getElementById("biz-mobile"),
    email: document.getElementById("biz-email"),
    hsnCode: document.getElementById("biz-hsn"),
    gstRate: document.getElementById("biz-gst-rate"),
    invoicePrefix: document.getElementById("biz-invoice-prefix"),
    warrantyTerms: document.getElementById("biz-warranty-terms"),
  };
  Object.keys(bizFields).forEach((key) => {
    bizFields[key].value = business[key] != null ? business[key] : "";
    bizFields[key].addEventListener("input", () => {
      business[key] = key === "gstRate" ? Number(bizFields[key].value || 0) : bizFields[key].value;
      persist();
    });
  });

  /* ================= dialogs ================= */
  function openDialog(id) {
    document.getElementById(id).showModal();
  }
  function closeDialog(id) {
    document.getElementById(id).close();
  }
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest("dialog").close());
  });

  /* ---------- vehicle dialog ---------- */
  const dlgVehicle = document.getElementById("dlg-vehicle");
  document.getElementById("btn-add-vehicle").addEventListener("click", () => {
    document.getElementById("vehicle-dlg-title").textContent = "Add vehicle";
    document.getElementById("form-vehicle").reset();
    document.getElementById("vehicle-id").value = "";
    document.getElementById("vehicle-date").value = todayISO();
    openDialog("dlg-vehicle");
  });

  function openEditVehicle(id) {
    const v = getVehicle(id);
    if (!v) return;
    document.getElementById("vehicle-dlg-title").textContent = "Edit vehicle";
    document.getElementById("vehicle-id").value = v.id;
    document.getElementById("vehicle-model").value = v.model || "";
    document.getElementById("vehicle-variant").value = v.variant || "";
    document.getElementById("vehicle-reg").value = v.reg || "";
    document.getElementById("vehicle-date").value = v.purchaseDate || todayISO();
    document.getElementById("vehicle-price").value = v.purchasePrice || 0;
    document.getElementById("vehicle-expected-price").value = v.expectedSalePrice || "";
    document.getElementById("vehicle-supplier").value = v.supplier || "";
    document.getElementById("vehicle-colour").value = v.colour || "";
    document.getElementById("vehicle-controller-no").value = v.controllerNo || "";
    document.getElementById("vehicle-motor-no").value = v.motorNo || "";
    document.getElementById("vehicle-chassis-no").value = v.chassisNo || "";
    document.getElementById("vehicle-charger-no").value = v.chargerNo || "";
    document.getElementById("vehicle-battery-company").value = v.batteryCompany || "";
    document.getElementById("vehicle-battery-numbers").value = v.batteryNumbers || "";
    document.getElementById("vehicle-notes").value = v.notes || "";
    openDialog("dlg-vehicle");
  }

  document.getElementById("form-vehicle").addEventListener("submit", () => {
    const id = document.getElementById("vehicle-id").value || uid("veh");
    const existing = getVehicle(id);
    const record = {
      id,
      model: document.getElementById("vehicle-model").value.trim(),
      variant: document.getElementById("vehicle-variant").value.trim(),
      reg: document.getElementById("vehicle-reg").value.trim(),
      purchaseDate: document.getElementById("vehicle-date").value,
      purchasePrice: Number(document.getElementById("vehicle-price").value || 0),
      expectedSalePrice: document.getElementById("vehicle-expected-price").value === "" ? null : Number(document.getElementById("vehicle-expected-price").value),
      supplier: document.getElementById("vehicle-supplier").value.trim(),
      colour: document.getElementById("vehicle-colour").value.trim(),
      controllerNo: document.getElementById("vehicle-controller-no").value.trim(),
      motorNo: document.getElementById("vehicle-motor-no").value.trim(),
      chassisNo: document.getElementById("vehicle-chassis-no").value.trim(),
      chargerNo: document.getElementById("vehicle-charger-no").value.trim(),
      batteryCompany: document.getElementById("vehicle-battery-company").value.trim(),
      batteryNumbers: document.getElementById("vehicle-battery-numbers").value.trim(),
      notes: document.getElementById("vehicle-notes").value.trim(),
      status: existing ? existing.status : "in_stock",
    };
    if (existing) Object.assign(existing, record);
    else vehicles.push(record);
    persist();
    closeDialog("dlg-vehicle");
    renderAll();
    toast("Vehicle saved");
  });

  /* ---------- sale dialog ---------- */
  document.getElementById("btn-add-sale").addEventListener("click", () => openSaleDialog());
  function openSaleDialog(preVehicleId) {
    const form = document.getElementById("form-sale");
    form.reset();
    document.getElementById("sale-id").value = "";
    document.getElementById("sale-date").value = todayISO();
    const sel = document.getElementById("sale-vehicle");
    sel.innerHTML = "";
    const inStock = vehicles.filter((v) => v.status === "in_stock");
    if (inStock.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "No vehicles in stock";
      opt.value = "";
      sel.appendChild(opt);
    } else {
      inStock.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = vehicleLabel(v) + (v.reg ? " (" + v.reg + ")" : "");
        sel.appendChild(opt);
      });
    }
    if (preVehicleId) sel.value = preVehicleId;
    if (inStock.length === 0) {
      toast("No vehicles in stock to sell");
      return;
    }
    openDialog("dlg-sale");
  }

  document.getElementById("form-sale").addEventListener("submit", () => {
    const vehicleId = document.getElementById("sale-vehicle").value;
    if (!vehicleId) return;
    const sale = {
      id: uid("sale"),
      vehicleId,
      saleDate: document.getElementById("sale-date").value,
      salePrice: Number(document.getElementById("sale-price").value || 0),
      buyer: document.getElementById("sale-buyer").value.trim(),
      contact: document.getElementById("sale-contact").value.trim(),
      notes: document.getElementById("sale-notes").value.trim(),
    };
    sales.push(sale);
    const v = getVehicle(vehicleId);
    if (v) v.status = "sold";
    persist();
    closeDialog("dlg-sale");
    renderAll();
    toast("Sale recorded");
  });

  /* ---------- expense dialog ---------- */
  function refreshExpenseVehicleOptions() {
    const sel = document.getElementById("expense-vehicle");
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">General / overhead</option>';
    vehicles.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = vehicleLabel(v) + (v.reg ? " (" + v.reg + ")" : "");
      sel.appendChild(opt);
    });
    sel.value = currentVal || "";
  }

  document.getElementById("btn-add-expense").addEventListener("click", () => {
    document.getElementById("expense-dlg-title").textContent = "Add expense";
    document.getElementById("form-expense").reset();
    document.getElementById("expense-id").value = "";
    document.getElementById("expense-date").value = todayISO();
    refreshExpenseVehicleOptions();
    openDialog("dlg-expense");
  });

  function openEditExpense(id) {
    const e = expenses.find((x) => x.id === id);
    if (!e) return;
    document.getElementById("expense-dlg-title").textContent = "Edit expense";
    refreshExpenseVehicleOptions();
    document.getElementById("expense-id").value = e.id;
    document.getElementById("expense-date").value = e.date;
    document.getElementById("expense-category").value = e.category;
    document.getElementById("expense-amount").value = e.amount;
    document.getElementById("expense-vehicle").value = e.vehicleId || "";
    document.getElementById("expense-notes").value = e.notes || "";
    openDialog("dlg-expense");
  }

  document.getElementById("form-expense").addEventListener("submit", () => {
    const id = document.getElementById("expense-id").value || uid("exp");
    const existing = expenses.find((x) => x.id === id);
    const record = {
      id,
      date: document.getElementById("expense-date").value,
      category: document.getElementById("expense-category").value,
      amount: Number(document.getElementById("expense-amount").value || 0),
      vehicleId: document.getElementById("expense-vehicle").value || null,
      notes: document.getElementById("expense-notes").value.trim(),
    };
    if (existing) Object.assign(existing, record);
    else expenses.push(record);
    persist();
    closeDialog("dlg-expense");
    renderAll();
    toast("Expense saved");
  });

  /* ---------- invoice dialog ---------- */
  function uninvoicedSales() {
    return sales.filter((s) => !invoiceForSale(s.id));
  }

  function saleOptionLabel(s) {
    const v = getVehicle(s.vehicleId);
    return (v ? vehicleLabel(v) : "Vehicle") + " · " + formatDate(s.saleDate) + " · " + formatMoney(s.salePrice) + (s.buyer ? " · " + s.buyer : "");
  }

  function updateInvoiceSummary() {
    const saleId = document.getElementById("invoice-sale-select").value;
    const sale = sales.find((s) => s.id === saleId);
    const summaryEl = document.getElementById("invoice-vehicle-summary");
    const nameInput = document.getElementById("invoice-buyer-name");
    if (!sale) {
      summaryEl.textContent = "";
      return;
    }
    const v = getVehicle(sale.vehicleId);
    summaryEl.textContent = (v ? vehicleLabel(v) : "Vehicle") + " · Sale price " + formatMoney(sale.salePrice) + " · " + formatDate(sale.saleDate);
    if (!nameInput.dataset.touched) {
      nameInput.value = sale.buyer || "";
      document.getElementById("invoice-buyer-mobile").value = sale.contact || "";
    }
  }

  function openInvoiceDialog(preselectSaleId) {
    const candidates = uninvoicedSales();
    if (candidates.length === 0) {
      toast("Every sale already has an invoice");
      return;
    }
    const sel = document.getElementById("invoice-sale-select");
    sel.innerHTML = "";
    candidates
      .slice()
      .sort((a, b) => (b.saleDate || "").localeCompare(a.saleDate || ""))
      .forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = saleOptionLabel(s);
        sel.appendChild(opt);
      });
    if (preselectSaleId && candidates.some((s) => s.id === preselectSaleId)) sel.value = preselectSaleId;

    const nameInput = document.getElementById("invoice-buyer-name");
    nameInput.value = "";
    delete nameInput.dataset.touched;
    nameInput.addEventListener("input", () => { nameInput.dataset.touched = "1"; }, { once: true });
    document.getElementById("invoice-buyer-address").value = "";
    document.getElementById("invoice-buyer-mobile").value = "";
    document.getElementById("invoice-buyer-email").value = "";
    document.getElementById("invoice-buyer-gstin").value = "";
    document.getElementById("invoice-buyer-state").value = "";
    document.getElementById("invoice-supply-type").value = "intra";
    document.getElementById("invoice-gst-rate").value = business.gstRate || 5;
    document.getElementById("invoice-hsn").value = business.hsnCode || "8711";
    document.getElementById("invoice-receipt-no").value = "";
    updateInvoiceSummary();
    openDialog("dlg-invoice");
  }

  document.getElementById("invoice-sale-select").addEventListener("change", updateInvoiceSummary);
  document.getElementById("btn-new-invoice").addEventListener("click", () => openInvoiceDialog());

  document.getElementById("form-invoice").addEventListener("submit", () => {
    const saleId = document.getElementById("invoice-sale-select").value;
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const v = getVehicle(sale.vehicleId);
    const gstRate = Number(document.getElementById("invoice-gst-rate").value || 0);
    const interState = document.getElementById("invoice-supply-type").value === "inter";
    const gst = computeGst(Number(sale.salePrice || 0), gstRate, interState);

    const invoice = {
      id: uid("inv"),
      invoiceNo: nextInvoiceNumber(sale.saleDate),
      date: sale.saleDate || todayISO(),
      saleId: sale.id,
      vehicleId: sale.vehicleId,
      vehicleLabel: v ? vehicleLabel(v) : "Vehicle",
      hsnCode: document.getElementById("invoice-hsn").value.trim(),
      receiptNo: document.getElementById("invoice-receipt-no").value.trim(),
      buyerName: document.getElementById("invoice-buyer-name").value.trim() || sale.buyer || "",
      buyerAddress: document.getElementById("invoice-buyer-address").value.trim(),
      buyerMobile: document.getElementById("invoice-buyer-mobile").value.trim() || sale.contact || "",
      buyerEmail: document.getElementById("invoice-buyer-email").value.trim(),
      buyerGstin: document.getElementById("invoice-buyer-gstin").value.trim(),
      buyerState: document.getElementById("invoice-buyer-state").value.trim(),
      interState,
      gstRate,
      taxableValue: gst.taxableValue,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      total: gst.total,
    };
    invoices.push(invoice);
    business.nextInvoiceNo = Number(business.nextInvoiceNo || 1) + 1;
    persist();
    closeDialog("dlg-invoice");
    renderAll();
    toast("Invoice " + invoice.invoiceNo + " generated");
  });

  /* ================= stock table ================= */
  const stockSearch = document.getElementById("stock-search");
  const stockFilter = document.getElementById("stock-filter");
  stockSearch.addEventListener("input", renderStock);
  stockFilter.addEventListener("change", renderStock);

  function renderStock() {
    const tbody = document.querySelector("#table-vehicles tbody");
    tbody.innerHTML = "";
    const q = stockSearch.value.trim().toLowerCase();
    const filterVal = stockFilter.value;
    const rows = vehicles.filter((v) => {
      if (filterVal !== "all" && v.status !== filterVal) return false;
      if (!q) return true;
      return (v.model + " " + v.variant + " " + v.reg).toLowerCase().includes(q);
    });
    document.getElementById("stock-empty").classList.toggle("hidden", vehicles.length !== 0);

    rows
      .slice()
      .sort((a, b) => (b.purchaseDate || "").localeCompare(a.purchaseDate || ""))
      .forEach((v) => {
        const tr = document.createElement("tr");
        const badge =
          v.status === "sold"
            ? '<span class="badge badge-sold">Sold</span>'
            : '<span class="badge badge-instock">In stock</span>';
        const hasExpected = v.expectedSalePrice != null && v.expectedSalePrice > 0;
        const expectedProfit = hasExpected ? v.expectedSalePrice - Number(v.purchasePrice || 0) : null;
        tr.innerHTML =
          "<td><div class=\"vehicle-cell\"><span class=\"vehicle-avatar\">" + ICONS.car + "</span>" + escapeHtml(vehicleLabel(v)) + "</div></td>" +
          "<td>" + escapeHtml(v.reg || "—") + "</td>" +
          "<td>" + formatDate(v.purchaseDate) + "</td>" +
          "<td class=\"num\">" + formatMoney(v.purchasePrice) + "</td>" +
          "<td class=\"num\">" + (hasExpected ? formatMoney(v.expectedSalePrice) : "—") + "</td>" +
          "<td class=\"num " + (hasExpected ? (expectedProfit >= 0 ? "profit-pos" : "profit-neg") : "") + "\">" + (hasExpected ? formatMoney(expectedProfit) : "—") + "</td>" +
          "<td>" + escapeHtml(v.supplier || "—") + "</td>" +
          "<td>" + badge + "</td>" +
          "<td class=\"actions-col\"></td>";
        const actionsTd = tr.querySelector("td.actions-col");
        const wrap = document.createElement("div");
        wrap.className = "row-actions";

        if (v.status === "in_stock") {
          const sellBtn = document.createElement("button");
          sellBtn.className = "icon-btn accent";
          sellBtn.title = "Mark sold";
          sellBtn.innerHTML = ICONS.tag + '<span class="sr-only">Mark sold</span>';
          sellBtn.addEventListener("click", () => openSaleDialog(v.id));
          wrap.appendChild(sellBtn);
        }
        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.title = "Edit";
        editBtn.innerHTML = ICONS.edit + '<span class="sr-only">Edit</span>';
        editBtn.addEventListener("click", () => openEditVehicle(v.id));
        wrap.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn danger";
        delBtn.title = "Delete";
        delBtn.innerHTML = ICONS.trash + '<span class="sr-only">Delete</span>';
        if (v.status === "sold") {
          delBtn.disabled = true;
          delBtn.title = "Sold vehicles can't be deleted — delete the sale first";
        } else {
          delBtn.addEventListener("click", () => {
            if (confirm("Delete this vehicle? This cannot be undone.")) {
              vehicles = vehicles.filter((x) => x.id !== v.id);
              expenses = expenses.filter((x) => x.vehicleId !== v.id);
              persist();
              renderAll();
              toast("Vehicle deleted");
            }
          });
        }
        wrap.appendChild(delBtn);
        actionsTd.appendChild(wrap);
        tbody.appendChild(tr);
      });
  }

  /* ================= sales table ================= */
  function renderSales() {
    const tbody = document.querySelector("#table-sales tbody");
    tbody.innerHTML = "";
    document.getElementById("sales-empty").classList.toggle("hidden", sales.length !== 0);
    sales
      .slice()
      .sort((a, b) => (b.saleDate || "").localeCompare(a.saleDate || ""))
      .forEach((s) => {
        const v = getVehicle(s.vehicleId);
        const purchase = v ? Number(v.purchasePrice || 0) : 0;
        const exp = v ? expensesForVehicle(v.id) : 0;
        const profit = saleProfit(s);
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td><div class=\"vehicle-cell\"><span class=\"vehicle-avatar\">" + ICONS.car + "</span>" + escapeHtml(v ? vehicleLabel(v) : "(deleted vehicle)") + "</div></td>" +
          "<td>" + formatDate(s.saleDate) + "</td>" +
          "<td>" + escapeHtml(s.buyer || "—") + "</td>" +
          "<td class=\"num\">" + formatMoney(s.salePrice) + "</td>" +
          "<td class=\"num\">" + formatMoney(purchase) + "</td>" +
          "<td class=\"num\">" + formatMoney(exp) + "</td>" +
          "<td class=\"num " + (profit >= 0 ? "profit-pos" : "profit-neg") + "\">" + formatMoney(profit) + "</td>" +
          "<td class=\"actions-col\"></td>";
        const actionsTd = tr.querySelector("td.actions-col");
        const wrap = document.createElement("div");
        wrap.className = "row-actions";

        const existingInvoice = invoiceForSale(s.id);
        const invBtn = document.createElement("button");
        if (existingInvoice) {
          invBtn.className = "icon-btn accent";
          invBtn.title = "View / print invoice " + existingInvoice.invoiceNo;
          invBtn.innerHTML = ICONS.eye + '<span class="sr-only">View invoice</span>';
          invBtn.addEventListener("click", () => printInvoice(existingInvoice.id));
        } else {
          invBtn.className = "icon-btn accent";
          invBtn.title = "Generate GST invoice";
          invBtn.innerHTML = ICONS.card + '<span class="sr-only">Generate invoice</span>';
          invBtn.addEventListener("click", () => openInvoiceDialog(s.id));
        }
        wrap.appendChild(invBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn danger";
        delBtn.title = "Delete";
        delBtn.innerHTML = ICONS.trash + '<span class="sr-only">Delete</span>';
        delBtn.addEventListener("click", () => {
          if (confirm("Delete this sale? The vehicle will return to in-stock.")) {
            sales = sales.filter((x) => x.id !== s.id);
            invoices = invoices.filter((x) => x.saleId !== s.id);
            if (v) v.status = "in_stock";
            persist();
            renderAll();
            toast("Sale deleted");
          }
        });
        wrap.appendChild(delBtn);
        actionsTd.appendChild(wrap);
        tbody.appendChild(tr);
      });
  }

  /* ================= expenses table ================= */
  function renderExpenses() {
    const tbody = document.querySelector("#table-expenses tbody");
    tbody.innerHTML = "";
    document.getElementById("expenses-empty").classList.toggle("hidden", expenses.length !== 0);
    expenses
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .forEach((e) => {
        const v = e.vehicleId ? getVehicle(e.vehicleId) : null;
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + formatDate(e.date) + "</td>" +
          "<td>" + escapeHtml(e.category) + "</td>" +
          "<td>" + escapeHtml(v ? vehicleLabel(v) : "General") + "</td>" +
          "<td class=\"num\">" + formatMoney(e.amount) + "</td>" +
          "<td>" + escapeHtml(e.notes || "—") + "</td>" +
          "<td class=\"actions-col\"></td>";
        const actionsTd = tr.querySelector("td.actions-col");
        const wrap = document.createElement("div");
        wrap.className = "row-actions";
        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.title = "Edit";
        editBtn.innerHTML = ICONS.edit + '<span class="sr-only">Edit</span>';
        editBtn.addEventListener("click", () => openEditExpense(e.id));
        wrap.appendChild(editBtn);
        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn danger";
        delBtn.title = "Delete";
        delBtn.innerHTML = ICONS.trash + '<span class="sr-only">Delete</span>';
        delBtn.addEventListener("click", () => {
          if (confirm("Delete this expense?")) {
            expenses = expenses.filter((x) => x.id !== e.id);
            persist();
            renderAll();
            toast("Expense deleted");
          }
        });
        wrap.appendChild(delBtn);
        actionsTd.appendChild(wrap);
        tbody.appendChild(tr);
      });
  }

  /* ================= dashboard ================= */
  function inRange(dateStr, fromISO) {
    return dateStr && dateStr >= fromISO;
  }

  function renderDashboard() {
    const statGrid = document.getElementById("stat-grid");
    const featuredMonth = latestActiveMonthKey();
    const summary = computeMonthSummary(featuredMonth);

    const badgeText = document.getElementById("month-badge-text");
    if (badgeText) badgeText.textContent = summary.label;

    const stockCount = vehicles.filter((v) => v.status === "in_stock").length;
    const stockValue = vehicles.filter((v) => v.status === "in_stock").reduce((s, v) => s + Number(v.purchasePrice || 0), 0);
    const marginPct = summary.revenue > 0 ? Math.round((summary.profit / summary.revenue) * 100) : 0;

    const cards = [
      {
        cls: "stock", icon: ICONS.box,
        label: "Current stock", value: stockCount,
        sub: formatMoney(stockValue) + " invested",
      },
      {
        cls: "purchase", icon: ICONS.bag,
        label: "Purchases", value: summary.purchasedList.length,
        sub: formatMoney(summary.purchaseCostOfPurchased) + " spent",
      },
      {
        cls: "sales", icon: ICONS.trending,
        label: "Vehicles sold", value: summary.soldList.length,
        sub: formatMoney(summary.revenue) + " revenue",
      },
      {
        cls: "expenses", icon: ICONS.receipt,
        label: "Expenses", value: formatMoney(summary.expensesTotal),
        sub: summary.expensesList.length + " entries",
      },
      {
        cls: "profit", icon: ICONS.award,
        label: "Net profit", value: formatMoney(summary.profit),
        sub: summary.soldList.length === 0
          ? "No sales recorded yet"
          : (summary.profit >= 0 ? "Profitable · " + marginPct + "% margin" : "Running at a loss"),
        valueCls: summary.soldList.length === 0 ? "" : (summary.profit >= 0 ? "good" : "critical"),
      },
    ];

    statGrid.innerHTML = "";
    cards.forEach((c) => {
      const div = document.createElement("div");
      div.className = "stat-card stat-card--" + c.cls;
      div.innerHTML =
        '<div class="stat-card-icon">' + c.icon + "</div>" +
        '<div class="stat-card-label">' + c.label + "</div>" +
        '<div class="stat-card-value ' + (c.valueCls || "") + '">' + c.value + "</div>" +
        '<div class="stat-card-sub">' + c.sub + "</div>";
      statGrid.appendChild(div);
    });

    renderStockFlow(summary);
    renderInventoryValue();
    renderRevenueBreakdown(summary);

    // recent sales mini table
    const recentWrap = document.getElementById("recent-sales");
    const recent = sales
      .slice()
      .sort((a, b) => (b.saleDate || "").localeCompare(a.saleDate || ""))
      .slice(0, 5);
    if (recent.length === 0) {
      recentWrap.innerHTML = '<p class="mini-empty">No sales recorded yet.</p>';
    } else {
      let html = "<table><thead><tr><th>Vehicle</th><th>Buyer</th><th>Date</th><th class=\"num\">Profit</th></tr></thead><tbody>";
      recent.forEach((s) => {
        const v = getVehicle(s.vehicleId);
        const profit = saleProfit(s);
        html +=
          "<tr><td><div class=\"vehicle-cell\"><span class=\"vehicle-avatar\">" + ICONS.car + "</span>" +
          escapeHtml(v ? vehicleLabel(v) : "—") + "</div></td>" +
          "<td>" + escapeHtml(s.buyer || "—") + "</td>" +
          "<td>" + formatDate(s.saleDate) + '</td><td class="num ' +
          (profit >= 0 ? "profit-pos" : "profit-neg") + '">' + formatMoney(profit) + "</td></tr>";
      });
      html += "</tbody></table>";
      recentWrap.innerHTML = html;
    }

    // monthly profit trend, last 12 months
    const months = lastNMonths(12);
    const chartData = months.map((m) => {
      const label = m.label;
      const monthSalesList = sales.filter((s) => (s.saleDate || "").slice(0, 7) === m.key);
      const revenue = monthSalesList.reduce((s, x) => s + Number(x.salePrice || 0), 0);
      const cost = monthSalesList.reduce((s, x) => {
        const v = getVehicle(x.vehicleId);
        return s + (v ? Number(v.purchasePrice || 0) : 0);
      }, 0);
      const exp = expenses.filter((e) => (e.date || "").slice(0, 7) === m.key).reduce((s, x) => s + Number(x.amount || 0), 0);
      return { label, value: revenue - cost - exp };
    });
    renderDivergingBarChart(document.getElementById("profit-chart"), chartData);
  }

  /* ---------- stock movement stepper ---------- */
  function renderStockFlow(summary) {
    const el = document.getElementById("stock-flow");
    if (!el) return;
    const sub = document.getElementById("stock-flow-sub");
    if (sub) sub.textContent = summary.label + " — opening stock → purchases → sales → current stock, calculated automatically";

    const steps = [
      { cls: "opening", label: "Opening stock", value: summary.opening, icon: ICONS.box },
      { cls: "purchased", label: "Purchased", value: "+" + summary.purchasedList.length, icon: ICONS.bag },
      { cls: "sold", label: "Sold", value: "−" + summary.soldList.length, icon: ICONS.trending },
      { cls: "closing", label: "Current stock", value: summary.closing, icon: ICONS.award },
    ];

    let html = "";
    steps.forEach((s, i) => {
      html +=
        '<div class="stepper-step ' + s.cls + '">' +
        '<span class="stepper-icon">' + s.icon + "</span>" +
        '<span class="stepper-value">' + s.value + "</span>" +
        '<span class="stepper-label">' + s.label + "</span>" +
        "</div>";
      if (i < steps.length - 1) {
        html += '<div class="stepper-arrow">' + ICONS.arrowRight + "</div>";
      }
    });
    el.innerHTML = html;
  }

  /* ---------- current inventory value & expected profit ---------- */
  function renderInventoryValue() {
    const el = document.getElementById("inventory-value");
    if (!el) return;

    const inStock = vehicles.filter((v) => v.status === "in_stock");
    const priced = inStock.filter((v) => v.expectedSalePrice != null && v.expectedSalePrice > 0);
    const pending = inStock.filter((v) => !(v.expectedSalePrice != null && v.expectedSalePrice > 0));

    if (inStock.length === 0) {
      el.innerHTML = '<p class="mini-empty">No vehicles currently in stock.</p>';
      return;
    }

    const stockValue = inStock.reduce((s, v) => s + Number(v.purchasePrice || 0), 0);
    const expectedRevenue = priced.reduce((s, v) => s + Number(v.expectedSalePrice || 0), 0);
    const expectedCost = priced.reduce((s, v) => s + Number(v.purchasePrice || 0), 0);
    const expectedProfit = expectedRevenue - expectedCost;

    let html = '<div class="inventory-grid">' +
      '<div class="inventory-item"><div class="inventory-item-label">Stock value invested</div>' +
      '<div class="inventory-item-value">' + formatMoney(stockValue) + '</div>' +
      '<div class="inventory-item-sub">' + inStock.length + ' vehicles in stock</div></div>' +
      '<div class="inventory-item"><div class="inventory-item-label">Expected revenue</div>' +
      '<div class="inventory-item-value">' + (priced.length ? formatMoney(expectedRevenue) : "—") + '</div>' +
      '<div class="inventory-item-sub">from ' + priced.length + ' priced vehicle' + (priced.length === 1 ? "" : "s") + '</div></div>' +
      '<div class="inventory-item"><div class="inventory-item-label">Expected profit</div>' +
      '<div class="inventory-item-value ' + (priced.length ? (expectedProfit >= 0 ? "good" : "critical") : "") + '">' + (priced.length ? formatMoney(expectedProfit) : "—") + '</div>' +
      '<div class="inventory-item-sub">if sold at expected price</div></div>' +
      "</div>";

    if (pending.length > 0) {
      const suppliers = pending.map((v) => v.supplier || "unlisted supplier").filter((s, i, a) => a.indexOf(s) === i);
      html += '<div class="inventory-note">' + ICONS.info + '<span>' + pending.length + ' vehicle' + (pending.length === 1 ? "" : "s") +
        ' (' + escapeHtml(suppliers.join(", ")) +
        ') still need an expected selling price — add one via Edit to include them in expected profit.</span></div>';
    }

    el.innerHTML = html;
  }

  /* ---------- revenue breakdown bar ---------- */
  function renderRevenueBreakdown(summary) {
    const el = document.getElementById("revenue-breakdown");
    const subEl = document.getElementById("breakdown-sub");
    if (!el) return;
    if (subEl) subEl.textContent = "Where " + summary.label + "'s revenue goes";

    const styles = getComputedStyle(document.documentElement);
    const seriesBlue = styles.getPropertyValue("--series-1").trim();
    const seriesOrange = styles.getPropertyValue("--series-2").trim();
    const good = styles.getPropertyValue("--good").trim();
    const critical = styles.getPropertyValue("--critical").trim();

    const cost = summary.purchaseCostOfSold;
    const exp = summary.expensesTotal;
    const profit = summary.profit;

    if (summary.soldList.length === 0 && exp === 0) {
      el.innerHTML = '<p class="mini-empty">No sales or expenses recorded for ' + escapeHtml(summary.label) + " yet.</p>";
      return;
    }

    const segments = [
      { label: "Purchase cost", value: cost, color: seriesBlue },
      { label: "Expenses", value: exp, color: seriesOrange },
      { label: "Net profit", value: Math.max(profit, 0), color: good },
    ];
    const positiveTotal = segments.reduce((s, x) => s + x.value, 0) || 1;

    let track = "";
    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const pct = (seg.value / positiveTotal) * 100;
      track += '<div class="breakdown-seg" style="width:' + pct.toFixed(2) + "%;background:" + seg.color + ';" title="' + escapeAttr(seg.label) + ": " + escapeAttr(formatMoney(seg.value)) + '"></div>';
    });

    let legend = '<div class="breakdown-legend">';
    segments.forEach((seg) => {
      legend += '<span><i style="background:' + seg.color + '"></i>' + seg.label + ": <b>" + formatMoney(seg.value) + "</b></span>";
    });
    legend += "</div>";

    let footer = '<div class="breakdown-total">Revenue <b>' + formatMoney(summary.revenue) + "</b>";
    if (profit < 0) {
      footer += ' · <span style="color:' + critical + '">Loss of ' + formatMoney(Math.abs(profit)) + "</span>";
    }
    footer += "</div>";

    el.innerHTML = '<div class="breakdown-track">' + track + "</div>" + legend + footer;
  }

  function lastNMonths(n) {
    const out = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      const label = d.toLocaleDateString(undefined, { month: "short" });
      out.push({ key, label });
    }
    return out;
  }

  /* ================= reports ================= */
  let reportPeriod = "daily";
  document.querySelectorAll(".segmented-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".segmented-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      reportPeriod = btn.dataset.period;
      renderReports();
    });
  });

  function bucketsForPeriod(period) {
    const now = new Date();
    const out = [];
    if (period === "daily") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = toLocalISODate(d);
        out.push({ key, label: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }) });
      }
    } else if (period === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        out.push({ key, label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const y = now.getFullYear() - i;
        out.push({ key: String(y), label: String(y) });
      }
    }
    return out;
  }

  function keyLen(period) {
    return period === "daily" ? 10 : period === "monthly" ? 7 : 4;
  }

  function renderReports() {
    const period = reportPeriod;
    const buckets = bucketsForPeriod(period);
    const len = keyLen(period);

    document.getElementById("report-chart-sub").textContent =
      period === "daily" ? "Last 30 days" : period === "monthly" ? "Last 12 months" : "Last 5 years";

    const rows = buckets.map((b) => {
      const bucketSales = sales.filter((s) => (s.saleDate || "").slice(0, len) === b.key);
      const revenue = bucketSales.reduce((s, x) => s + Number(x.salePrice || 0), 0);
      const purchaseCost = bucketSales.reduce((s, x) => {
        const v = getVehicle(x.vehicleId);
        return s + (v ? Number(v.purchasePrice || 0) : 0);
      }, 0);
      const bucketExpenses = expenses.filter((e) => (e.date || "").slice(0, len) === b.key).reduce((s, x) => s + Number(x.amount || 0), 0);
      const profit = revenue - purchaseCost - bucketExpenses;
      return {
        label: b.label,
        count: bucketSales.length,
        revenue,
        purchaseCost,
        expenses: bucketExpenses,
        profit,
      };
    });

    const hasAny = sales.length > 0 || expenses.length > 0;
    document.getElementById("report-empty").classList.toggle("hidden", hasAny);

    renderDivergingBarChart(document.getElementById("report-chart"), rows.map((r) => ({ label: r.label, value: r.profit })), period);

    const tbody = document.querySelector("#table-report tbody");
    tbody.innerHTML = "";
    rows
      .slice()
      .reverse()
      .forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHtml(r.label) + "</td>" +
          "<td class=\"num\">" + r.count + "</td>" +
          "<td class=\"num\">" + formatMoney(r.revenue) + "</td>" +
          "<td class=\"num\">" + formatMoney(r.purchaseCost) + "</td>" +
          "<td class=\"num\">" + formatMoney(r.expenses) + "</td>" +
          "<td class=\"num " + (r.profit >= 0 ? "profit-pos" : "profit-neg") + "\">" + formatMoney(r.profit) + "</td>";
        tbody.appendChild(tr);
      });
  }

  /* ================= chart: diverging bar ================= */
  const tooltipEl = document.getElementById("chart-tooltip");

  function renderDivergingBarChart(container, data, periodHint) {
    container.innerHTML = "";
    if (!data.length) return;

    const styles = getComputedStyle(document.documentElement);
    const good = styles.getPropertyValue("--good").trim() || "#0ca30c";
    const critical = styles.getPropertyValue("--critical").trim() || "#d03b3b";
    const gridline = styles.getPropertyValue("--gridline").trim() || "#e1e0d9";
    const muted = styles.getPropertyValue("--text-muted").trim() || "#898781";
    const baseline = styles.getPropertyValue("--baseline").trim() || "#c3c2b7";

    const width = Math.max(container.clientWidth || 560, data.length * 26);
    const height = 220;
    const padTop = 14, padBottom = 28, padLeft = 8, padRight = 8;
    const plotH = height - padTop - padBottom;
    const plotW = width - padLeft - padRight;

    const maxPos = Math.max(0, ...data.map((d) => d.value));
    const maxNeg = Math.max(0, ...data.map((d) => -d.value));
    const totalRange = maxPos + maxNeg || 1;
    const zeroY = padTop + plotH * (maxPos / totalRange);

    const n = data.length;
    const slot = plotW / n;
    const barW = Math.min(24, slot * 0.6);

    // label thinning
    let showEvery = 1;
    if (periodHint === "daily") showEvery = Math.ceil(n / 10);
    else if (!periodHint) showEvery = Math.ceil(n / 12);

    let svg = '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Profit by period">';
    svg += '<line x1="' + padLeft + '" y1="' + zeroY + '" x2="' + (width - padRight) + '" y2="' + zeroY + '" stroke="' + baseline + '" stroke-width="1"/>';

    data.forEach((d, i) => {
      const cx = padLeft + slot * i + slot / 2;
      const x = cx - barW / 2;
      let y, h, side, color;
      if (d.value >= 0) {
        h = (d.value / totalRange) * plotH;
        y = zeroY - h;
        side = "top";
        color = good;
      } else {
        h = (-d.value / totalRange) * plotH;
        y = zeroY;
        side = "bottom";
        color = critical;
      }
      h = Math.max(h, d.value === 0 ? 0 : 2);
      const r = Math.min(4, barW / 2, h / 2);
      svg += '<path d="' + roundedBarPath(x, y, barW, h, r, side) + '" fill="' + color + '" data-label="' + escapeAttr(d.label) + '" data-value="' + d.value + '" class="bar-mark" style="cursor:pointer"/>';

      if (i % showEvery === 0) {
        svg += '<text x="' + cx + '" y="' + (height - 8) + '" font-size="10" fill="' + muted + '" text-anchor="middle" font-family="system-ui, sans-serif">' + escapeXml(d.label) + "</text>";
      }
    });

    svg += "</svg>";
    container.innerHTML = svg;

    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.innerHTML =
      '<span><i style="background:' + good + '"></i>Profit</span>' +
      '<span><i style="background:' + critical + '"></i>Loss</span>';
    container.appendChild(legend);

    container.querySelectorAll(".bar-mark").forEach((bar) => {
      bar.addEventListener("mouseenter", showTip);
      bar.addEventListener("mousemove", showTip);
      bar.addEventListener("mouseleave", () => tooltipEl.classList.add("hidden"));
    });

    function showTip(evt) {
      const label = evt.target.getAttribute("data-label");
      const value = Number(evt.target.getAttribute("data-value"));
      tooltipEl.textContent = label + ": " + formatMoney(value);
      tooltipEl.style.left = evt.clientX + "px";
      tooltipEl.style.top = evt.clientY + "px";
      tooltipEl.classList.remove("hidden");
    }
  }

  function roundedBarPath(x, y, w, h, r, side) {
    if (h <= 0) h = 0;
    r = Math.max(0, Math.min(r, w / 2, h / 2 || 0));
    if (side === "top") {
      return (
        "M" + x + "," + (y + h) +
        " L" + x + "," + (y + r) +
        " Q" + x + "," + y + " " + (x + r) + "," + y +
        " L" + (x + w - r) + "," + y +
        " Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) +
        " L" + (x + w) + "," + (y + h) +
        " Z"
      );
    }
    return (
      "M" + x + "," + y +
      " L" + (x + w) + "," + y +
      " L" + (x + w) + "," + (y + h - r) +
      " Q" + (x + w) + "," + (y + h) + " " + (x + w - r) + "," + (y + h) +
      " L" + (x + r) + "," + (y + h) +
      " Q" + x + "," + (y + h) + " " + x + "," + (y + h - r) +
      " Z"
    );
  }

  /* ================= misc utils ================= */
  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }
  function escapeXml(str) {
    return escapeHtml(str);
  }

  /* ================= render all ================= */
  function renderAll() {
    renderStock();
    renderSales();
    renderExpenses();
    renderDashboard();
    renderReports();
    renderInvoices();
  }

  /* ================= invoices table (Billing tab) ================= */
  function renderInvoices() {
    const tbody = document.querySelector("#table-invoices tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    document.getElementById("invoices-empty").classList.toggle("hidden", invoices.length !== 0);
    document.getElementById("invoices-sub").textContent =
      invoices.length ? invoices.length + " invoice" + (invoices.length === 1 ? "" : "s") + " generated" : "Generate one from a row in the Sales tab";

    invoices
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .forEach((inv) => {
        const gstTotal = inv.interState ? inv.igst : inv.cgst + inv.sgst;
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHtml(inv.invoiceNo) + "</td>" +
          "<td>" + formatDate(inv.date) + "</td>" +
          "<td><div class=\"vehicle-cell\"><span class=\"vehicle-avatar\">" + ICONS.car + "</span>" + escapeHtml(inv.vehicleLabel) + "</div></td>" +
          "<td>" + escapeHtml(inv.buyerName || "—") + "</td>" +
          "<td class=\"num\">" + formatMoney(inv.taxableValue) + "</td>" +
          "<td class=\"num\">" + formatMoney(gstTotal) + "</td>" +
          "<td class=\"num\">" + formatMoney(inv.total) + "</td>" +
          "<td class=\"actions-col\"></td>";
        const actionsTd = tr.querySelector("td.actions-col");
        const wrap = document.createElement("div");
        wrap.className = "row-actions";

        const viewBtn = document.createElement("button");
        viewBtn.className = "icon-btn accent";
        viewBtn.title = "View / print";
        viewBtn.innerHTML = ICONS.printer + '<span class="sr-only">View / print</span>';
        viewBtn.addEventListener("click", () => printInvoice(inv.id));
        wrap.appendChild(viewBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn danger";
        delBtn.title = "Delete invoice";
        delBtn.innerHTML = ICONS.trash + '<span class="sr-only">Delete</span>';
        delBtn.addEventListener("click", () => {
          if (confirm("Delete invoice " + inv.invoiceNo + "? This cannot be undone.")) {
            invoices = invoices.filter((x) => x.id !== inv.id);
            persist();
            renderAll();
            toast("Invoice deleted");
          }
        });
        wrap.appendChild(delBtn);

        actionsTd.appendChild(wrap);
        tbody.appendChild(tr);
      });
  }

  window.addEventListener("resize", debounce(renderAll, 200));
  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  renderAll();
})();
