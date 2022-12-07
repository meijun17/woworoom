const orderListTable = document.querySelector(".orderTableBody");
const discardAllBtn = document.querySelector(".discardAllBtn");
const categoryBtn = document.querySelector(".category-btn");
const productBtn = document.querySelector(".product-btn");
const sectionTitle = document.querySelector(".section-title");
let ordersList = [];

function ordersDetailTemplate() {
  let str = "";
  ordersList.forEach((item) => {
    // 產品
    let productStr = "";
    item.products.forEach((product) => {
      productStr += `<p>${product.title} * ${product.quantity}</p>`;
    });
    // 時間
    let time = new Date(item.createdAt * 1000);
    let orderTime = `${time.getFullYear()}/${
      time.getMonth() + 1
    }/${time.getDate()}`;
    // 狀態
    let productStatus = item.paid ? "已處理" : "未處理";

    str += `
    <tr>
      <td>${item.id}</td>
      <td><p>${item.user.name}</p></td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>${productStr}</td>
      <td>${orderTime}</td>
      <td class="orderStatus">
          <a href="#" class="js-orderStatus" data-status=${item.paid} data-id=${item.id}>${productStatus}</a>
      </td>
      <td>
          <input
              type="button"
              class="delSingleOrder-Btn"
              data-id=${item.id}
              value="刪除"
          >
      </td>
    </tr>
    `;
  });
  orderListTable.innerHTML = str;
}

function changeOrderStatus(status, id) {
  status = status === "true" ? false : true;
  let data = {
    id: id,
    paid: status,
  };
  axios
    .put(
      `${adminUrl}/${api_path}/orders`,
      { data },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then((res) => {
      alert("修改訂單成功");
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}

function deleteOrderItem(id) {
  axios
    .delete(`${adminUrl}/${api_path}/orders/${id}`, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      alert("刪除訂單成功");
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}

function ordersHandler(e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  const id = e.target.dataset.id;
  if (targetClass === "js-orderStatus") {
    const status = e.target.dataset.status;
    changeOrderStatus(status, id);
  }
  if (targetClass === "delSingleOrder-Btn") {
    deleteOrderItem(id);
  }
}

function renderC3(val) {
  let obj = {};
  ordersList.forEach((item) => {
    item.products.forEach((product) => {
      if (val === "category") {
        if (obj[product.category] === undefined) {
          obj[product.category] = product.price * product.quantity;
        } else {
          obj[product.category] += product.price * product.quantity;
        }
        sectionTitle.textContent = "全產品類別營收比重";
        categoryBtn.classList.add("active");
        productBtn.classList.remove("active");
      } else {
        if (obj[product.title] === undefined) {
          obj[product.title] = product.price * product.quantity;
        } else {
          obj[product.title] += product.price * product.quantity;
        }
        sectionTitle.textContent = "全品項營收比重";
        categoryBtn.classList.remove("active");
        productBtn.classList.add("active");
      }
    });
  });

  let productArr = Object.keys(obj);
  let sortArr = [];
  productArr.forEach((item) => {
    let arr = [];
    arr.push(item);
    arr.push(obj[item]);
    sortArr.push(arr);
  });
  sortArr.sort((a, b) => {
    return b[1] - a[1];
  });
  if (sortArr.length > 3) {
    let otherItemTotal = 0;
    sortArr.forEach((item, index) => {
      if (index > 2) {
        otherItemTotal += sortArr[index][1];
      }
    });
    sortArr.splice(3, sortArr.length - 1);
    sortArr.push(["其他", otherItemTotal]);
  }
  let chart = c3.generate({
    bindto: "#chart",
    data: {
      type: "pie",
      columns: sortArr,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}

function getOrderList() {
  axios
    .get(`${adminUrl}/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      ordersList = res.data.orders;
      ordersDetailTemplate();
      renderC3("category");
    })
    .catch((err) => {
      console.log(err);
    });
}

function clearAllOrders(e) {
  e.preventDefault();
  axios
    .delete(`${adminUrl}/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      alert("刪除全部訂單成功");
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}

function init() {
  getOrderList();
}
init();

orderListTable.addEventListener("click", ordersHandler);
discardAllBtn.addEventListener("click", clearAllOrders);

categoryBtn.addEventListener("click", renderC3.bind(null, "category"));
productBtn.addEventListener("click", renderC3.bind(null, "product"));
