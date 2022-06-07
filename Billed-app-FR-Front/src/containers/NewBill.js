import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  //Correctif TEST 3 (BUG HUNT - Bills) : Correctif lié au format de
  //document soumis lors de la création d'une note de frais
  // + Visualisation du document
  handleChangeFile = (e) => {
    e.preventDefault();
    let files = this.document.querySelector(`input[data-testid="file"]`);
    //.files[0];
    let file = files.files[0];
    let fileName = file.name;

    /*
    Code origine :
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    */

    //Méthode "match" afin de trouver la concordance
    //avec le format de fichier
    if (
      file.type.match("image/jpg") ||
      file.type.match("image/jpeg") ||
      file.type.match("image/png")
    ) {
      const formData = new FormData();
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file);
      formData.append("email", email);

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          console.log(fileUrl);
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => {
          console.error("create error");
          const rootDiv = document.getElementById("root");
          rootDiv.innerHTML = ErrorPage(error);
        });
    } else {
      //Message qui va s'afficher si l'utilisateur entre un
      //format différent de ceux cités dans la méthode match()
      alert("Seuls les formats JPG, JPEG et PNG sont acceptés");
      e.target.value = null;
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => {
          console.error("update error");
          // Show error page (because error is not a parameter in NewBillUI)
          const rootDiv = document.getElementById("root");
          rootDiv.innerHTML = ErrorPage(error);
        });
    }
  };
}
