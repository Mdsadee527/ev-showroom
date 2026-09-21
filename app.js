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
  const CURRENT_SEED_VERSION = "3"; // bump to apply a new one-time data migration on next load

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
    gstin: "",
    address: "",
    state: "",
    hsnCode: "8711",
    gstRate: 5,
    invoicePrefix: "INV",
    nextInvoiceNo: 1,
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

  function buildInvoiceHtml(inv) {
    const taxRow = inv.interState
      ? '<tr><td>IGST (' + inv.gstRate + '%)</td><td class="num">' + formatMoney(inv.igst) + "</td></tr>"
      : '<tr><td>CGST (' + (inv.gstRate / 2) + '%)</td><td class="num">' + formatMoney(inv.cgst) + "</td></tr>" +
        '<tr><td>SGST (' + (inv.gstRate / 2) + '%)</td><td class="num">' + formatMoney(inv.sgst) + "</td></tr>";

    return (
      "<!doctype html><html><head><meta charset='utf-8'><title>" + escapeHtml(inv.invoiceNo) + "</title>" +
      "<style>" +
      "body{font-family:Arial,Helvetica,sans-serif;color:#101322;max-width:720px;margin:32px auto;padding:0 16px;}" +
      "h1{font-size:20px;margin:0 0 2px;}" +
      ".muted{color:#565b72;font-size:12.5px;}" +
      ".head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #101322;padding-bottom:14px;margin-bottom:16px;}" +
      ".tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:#101322;color:#fff;padding:4px 10px;border-radius:4px;margin-bottom:8px;}" +
      ".meta{text-align:right;font-size:12.5px;}" +
      ".parties{display:flex;justify-content:space-between;gap:24px;margin-bottom:20px;}" +
      ".party{flex:1;font-size:12.5px;}" +
      ".party b{display:block;font-size:13.5px;margin-bottom:4px;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:4px;}" +
      "th,td{padding:8px 6px;text-align:left;border-bottom:1px solid #d8dae3;}" +
      "th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#565b72;}" +
      ".num{text-align:right;}" +
      ".totals{width:280px;margin-left:auto;margin-top:8px;}" +
      ".totals td{border-bottom:none;padding:4px 6px;}" +
      ".totals .grand td{border-top:2px solid #101322;font-weight:700;font-size:15px;padding-top:8px;}" +
      ".foot{margin-top:48px;display:flex;justify-content:space-between;align-items:flex-end;font-size:12px;color:#565b72;}" +
      ".sign{text-align:center;}" +
      ".sign .line{margin-top:36px;border-top:1px solid #101322;padding-top:4px;width:180px;}" +
      "@media print{.noprint{display:none;}}" +
      "</style></head><body>" +
      "<div class='head'>" +
      "<div><span class='tag'>Tax Invoice</span><h1>" + escapeHtml(business.name || "Your Business Name") + "</h1>" +
      "<div class='muted'>" + escapeHtml(business.address || "") + "</div>" +
      "<div class='muted'>" + (business.state ? "State: " + escapeHtml(business.state) + " · " : "") + "GSTIN: " + escapeHtml(business.gstin || "—") + "</div>" +
      "</div>" +
      "<div class='meta'><div><b>Invoice #</b> " + escapeHtml(inv.invoiceNo) + "</div>" +
      "<div><b>Date:</b> " + formatDate(inv.date) + "</div>" +
      "<div><b>Place of supply:</b> " + escapeHtml(inv.buyerState || "—") + "</div>" +
      "<div><b>Supply type:</b> " + (inv.interState ? "Inter-state" : "Intra-state") + "</div></div>" +
      "</div>" +
      "<div class='parties'>" +
      "<div class='party'><b>Bill To</b>" +
      escapeHtml(inv.buyerName || "Customer") + "<br>" +
      (inv.buyerAddress ? escapeHtml(inv.buyerAddress) + "<br>" : "") +
      (inv.buyerState ? escapeHtml(inv.buyerState) + "<br>" : "") +
      "GSTIN: " + escapeHtml(inv.buyerGstin || "Unregistered (B2C)") +
      "</div>" +
      "</div>" +
      "<table><thead><tr><th>Description</th><th>HSN/SAC</th><th class='num'>Qty</th><th class='num'>Taxable value</th></tr></thead>" +
      "<tbody><tr><td>" + escapeHtml(inv.vehicleLabel) + "</td><td>" + escapeHtml(inv.hsnCode || "—") + "</td><td class='num'>1</td><td class='num'>" + formatMoney(inv.taxableValue) + "</td></tr></tbody></table>" +
      "<table class='totals'><tbody>" +
      "<tr><td>Taxable value</td><td class='num'>" + formatMoney(inv.taxableValue) + "</td></tr>" +
      taxRow +
      "<tr class='grand'><td>Total</td><td class='num'>" + formatMoney(inv.total) + "</td></tr>" +
      "</tbody></table>" +
      "<div class='foot'><div>This is a computer-generated invoice.</div>" +
      "<div class='sign'>For " + escapeHtml(business.name || "the business") + "<div class='line'>Authorised signatory</div></div></div>" +
      "<div class='noprint' style='margin-top:24px;text-align:center;'><button onclick='window.print()' style='font-size:14px;padding:10px 20px;cursor:pointer;'>Print / Save as PDF</button></div>" +
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
    gstin: document.getElementById("biz-gstin"),
    address: document.getElementById("biz-address"),
    state: document.getElementById("biz-state"),
    hsnCode: document.getElementById("biz-hsn"),
    gstRate: document.getElementById("biz-gst-rate"),
    invoicePrefix: document.getElementById("biz-invoice-prefix"),
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
  function openInvoiceDialog(saleId) {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const v = getVehicle(sale.vehicleId);
    document.getElementById("invoice-sale-id").value = saleId;
    document.getElementById("invoice-vehicle-summary").textContent =
      (v ? vehicleLabel(v) : "Vehicle") + " · Sale price " + formatMoney(sale.salePrice) + (sale.buyer ? " · Buyer: " + sale.buyer : "");
    document.getElementById("invoice-buyer-address").value = "";
    document.getElementById("invoice-buyer-gstin").value = "";
    document.getElementById("invoice-buyer-state").value = "";
    document.getElementById("invoice-supply-type").value = "intra";
    document.getElementById("invoice-gst-rate").value = business.gstRate || 5;
    document.getElementById("invoice-hsn").value = business.hsnCode || "8711";
    openDialog("dlg-invoice");
  }

  document.getElementById("form-invoice").addEventListener("submit", () => {
    const saleId = document.getElementById("invoice-sale-id").value;
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
      buyerName: sale.buyer || "",
      buyerAddress: document.getElementById("invoice-buyer-address").value.trim(),
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
