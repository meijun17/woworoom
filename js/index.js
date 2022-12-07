const productSelect = document.querySelector(".productSelect");
const productWrap = document.querySelector(".productWrap");
const shoppingCartList = document.querySelector(".shoppingCart-table-list");
const discardAllBtn = document.querySelector(".discardAllBtn");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const form = document.querySelector(".orderInfo-form");
const errorMsg = document.querySelectorAll(".orderInfo-message");

let productsData = [];
let cartData = [];

const constraints = {
  姓名: {
    presence: {
      message: "是必填欄位",
    },
  },
  電話: {
    presence: {
      message: "是必填欄位",
    },
    format: {
      pattern: "^09\\d{8}$",
      message: "請輸入正確格式",
    },
  },
  Email: {
    presence: {
      message: "是必填欄位",
    },
    email: {
      message: "請輸入正確格式",
    },
  },
  寄送地址: {
    presence: {
      message: "是必填欄位",
    },
  },
};

function productsTemplate(product) {
  return `
    <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
            src="${product.images}"
            alt=""
        >
        <a
            href="#"
            class="addCardBtn"
            data-id=${product.id}
        >加入購物車</a>
        <h3>${product.title}</h3>
        <del class="originPrice">NT$${toThouthand(product.origin_price)}</del>
        <p class="nowPrice">NT$${toThouthand(product.price)}</p>
    </li>
    `;
}

function cartListTemplate(item) {
  document.querySelector(".total-price").textContent = toThouthand(
    item.data.finalTotal
  );
  cartData = item.data.carts;
  let str = "";
  cartData.forEach((item) => {
    str += `<tr>
        <td>
            <div class="cardItem-title">
                <img
                    src="${item.product.images}"
                    alt=""
                >
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${toThouthand(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${toThouthand(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
            <a
                href="#"
                class="material-icons"
                data-id=${item.id}
            >
                clear
            </a>
        </td>
    </tr>`;
  });
  shoppingCartList.innerHTML = str;
}

function getProductsData() {
  axios
    .get(`${url}/${api_path}/products`)
    .then((res) => {
      productsData = res.data.products;
      let str = "";
      productsData.forEach((item) => {
        str += productsTemplate(item);
      });
      productWrap.innerHTML = str;
    })
    .catch((err) => {
      console.log(err);
    });
}

function getCartList() {
  axios
    .get(`${url}/${api_path}/carts`)
    .then((res) => {
      cartListTemplate(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

function formValidation() {
  let errors = validate(form, constraints);
  errorMsg.forEach((msg) => (msg.innerHTML = ""));
  if (errors) {
    Object.keys(errors).forEach((error) => {
      errorMsg.forEach((msg) => {
        if (error === msg.dataset.message) {
          msg.innerHTML = errors[error];
        }
      });
    });
    return false;
  } else {
    return true;
  }
}

function postOrderInfo() {
  let data = {
    user: {
      name: document.getElementById("customerName").value,
      tel: document.getElementById("customerPhone").value,
      email: document.getElementById("customerEmail").value,
      address: document.getElementById("customerAddress").value,
      payment: document.getElementById("tradeWay").value,
    },
  };
  axios
    .post(`${url}/${api_path}/orders`, { data })
    .then(() => {
      alert("訂單建立成功。");
      form.reset(); // 清空訂單資訊
      getCartList(); // 重新取得購物車資訊
    })
    .catch((err) => {
      console.log(err);
    });
}

function toThouthand(num) {
  var parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function init() {
  getProductsData();
  getCartList();
}

init();

function productFilter(e) {
  const category = e.target.value;
  if (category === "全部") {
    getProductsData();
    return;
  }
  let str = "";
  productsData.forEach((item) => {
    if (item.category === category) {
      str += productsTemplate(item);
    }
  });
  productWrap.innerHTML = str;
}

function addItemToCart(e) {
  e.preventDefault();
  let productID = e.target.getAttribute("data-id");
  if (productID === null) return;
  let num = 1;
  cartData.forEach((item) => {
    if (item.product.id === productID) {
      num = item.quantity += 1;
    }
  });
  axios
    .post(`${url}/${api_path}/carts`, {
      data: {
        productId: productID,
        quantity: num,
      },
    })
    .then((res) => {
      cartListTemplate(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

function deleteItemFromCart(e) {
  e.preventDefault();
  const cartID = e.target.getAttribute("data-id");
  if (cartID === null) return;
  axios
    .delete(`${url}/${api_path}/carts/${cartID}`)
    .then((res) => {
      cartListTemplate(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

function clearCart(e) {
  e.preventDefault();
  axios
    .delete(`${url}/${api_path}/carts`)
    .then((res) => {
      cartListTemplate(res);
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
}

function checkOrderInfo(e) {
  e.preventDefault();
  let formCheck = false;
  if (cartData.length === 0) {
    alert("請先將產品加入購物車。");
    return;
  } else {
    formCheck = formValidation();
  }
  if (!formCheck) {
    alert("請輸入完整訂單資訊。");
    return;
  } else {
    postOrderInfo();
  }
}

productSelect.addEventListener("change", productFilter);
productWrap.addEventListener("click", addItemToCart);
shoppingCartList.addEventListener("click", deleteItemFromCart);
discardAllBtn.addEventListener("click", clearCart);
orderInfoBtn.addEventListener("click", checkOrderInfo);
