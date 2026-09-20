(function () {
  "use strict";

  /* ================= storage ================= */
  const KEYS = {
    vehicles: "evshowroom.vehicles",
    sales: "evshowroom.sales",
    expenses: "evshowroom.expenses",
    settings: "evshowroom.settings",
    theme: "evshowroom.theme",
  };

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

  function persist() {
    save(KEYS.vehicles, vehicles);
    save(KEYS.sales, sales);
    save(KEYS.expenses, expenses);
    save(KEYS.settings, settings);
  }

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
        tr.innerHTML =
          "<td>" + escapeHtml(vehicleLabel(v)) + "</td>" +
          "<td>" + escapeHtml(v.reg || "—") + "</td>" +
          "<td>" + formatDate(v.purchaseDate) + "</td>" +
          "<td class=\"num\">" + formatMoney(v.purchasePrice) + "</td>" +
          "<td>" + escapeHtml(v.supplier || "—") + "</td>" +
          "<td>" + badge + "</td>" +
          "<td class=\"actions-col\"></td>";
        const actionsTd = tr.querySelector("td.actions-col");
        const wrap = document.createElement("div");
        wrap.className = "row-actions";

        if (v.status === "in_stock") {
          const sellBtn = document.createElement("button");
          sellBtn.textContent = "Mark sold";
          sellBtn.addEventListener("click", () => openSaleDialog(v.id));
          wrap.appendChild(sellBtn);
        }
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openEditVehicle(v.id));
        wrap.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "danger";
        if (v.status === "sold") {
          delBtn.disabled = true;
          delBtn.title = "Sold vehicles can't be deleted — delete the sale first";
          delBtn.style.opacity = "0.4";
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
          "<td>" + escapeHtml(v ? vehicleLabel(v) : "(deleted vehicle)") + "</td>" +
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
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "danger";
        delBtn.addEventListener("click", () => {
          if (confirm("Delete this sale? The vehicle will return to in-stock.")) {
            sales = sales.filter((x) => x.id !== s.id);
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
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openEditExpense(e.id));
        wrap.appendChild(editBtn);
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "danger";
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
    const stockCount = vehicles.filter((v) => v.status === "in_stock").length;
    const soldCount = sales.length;
    const totalRevenue = sales.reduce((s, x) => s + Number(x.salePrice || 0), 0);
    const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
    const totalPurchaseCostSold = sales.reduce((s, x) => {
      const v = getVehicle(x.vehicleId);
      return s + (v ? Number(v.purchasePrice || 0) : 0);
    }, 0);
    const netProfit = totalRevenue - totalPurchaseCostSold - totalExpenses;

    const today = todayISO();
    const monthStart = today.slice(0, 7) + "-01";
    const todaySales = sales.filter((s) => s.saleDate === today);
    const monthSales = sales.filter((s) => inRange(s.saleDate, monthStart));

    const stockValue = vehicles.filter((v) => v.status === "in_stock").reduce((s, v) => s + Number(v.purchasePrice || 0), 0);

    const tiles = [
      { label: "Vehicles in stock", value: stockCount, sub: formatMoney(stockValue) + " invested" },
      { label: "Vehicles sold (all time)", value: soldCount, sub: todaySales.length + " sold today" },
      { label: "Total revenue", value: formatMoney(totalRevenue), sub: formatMoney(monthSales.reduce((s, x) => s + Number(x.salePrice || 0), 0)) + " this month" },
      { label: "Total expenses", value: formatMoney(totalExpenses), sub: "Across " + expenses.length + " entries" },
      { label: "Net profit (all time)", value: formatMoney(netProfit), sub: netProfit >= 0 ? "Profitable" : "Running at a loss", cls: netProfit >= 0 ? "good" : "critical" },
    ];

    statGrid.innerHTML = "";
    tiles.forEach((t) => {
      const div = document.createElement("div");
      div.className = "stat-tile";
      div.innerHTML =
        '<div class="stat-label">' + t.label + "</div>" +
        '<div class="stat-value ' + (t.cls || "") + '">' + t.value + "</div>" +
        '<div class="stat-sub">' + t.sub + "</div>";
      statGrid.appendChild(div);
    });

    // recent sales mini table
    const recentWrap = document.getElementById("recent-sales");
    const recent = sales
      .slice()
      .sort((a, b) => (b.saleDate || "").localeCompare(a.saleDate || ""))
      .slice(0, 5);
    if (recent.length === 0) {
      recentWrap.innerHTML = '<p class="mini-empty">No sales recorded yet.</p>';
    } else {
      let html = "<table><thead><tr><th>Vehicle</th><th>Date</th><th class=\"num\">Profit</th></tr></thead><tbody>";
      recent.forEach((s) => {
        const v = getVehicle(s.vehicleId);
        const profit = saleProfit(s);
        html +=
          "<tr><td>" + escapeHtml(v ? vehicleLabel(v) : "—") + "</td><td>" + formatDate(s.saleDate) + '</td><td class="num ' +
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
    const barW = Math.min(28, slot * 0.6);

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
