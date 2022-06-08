/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
window.alert = jest.fn();

//TO DO 5 :
//Test d'intégration POST
//Erreurs 404 & 500
describe("Given I am a user connected as Employee", () => {
  describe("When an error occurs on API", () => {
    var newCreatedBill = null;
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const user = JSON.stringify({
        type: "Employee",
        email: "a@a",
      });
      window.localStorage.setItem("user", user);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("Then file upload fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const fileChangeNewBill = screen.getByTestId("file");
      userEvent.upload(
        fileChangeNewBill,
        new File(["img"], "test_error_newbill.png", { type: "image/png" })
      );

      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Then file upload fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const fileChangeNewBill = screen.getByTestId("file");
      userEvent.upload(
        fileChangeNewBill,
        new File(["img"], "test_error_newbill.png", { type: "image/png" })
      );

      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});

//TO DO 5 : Ajout test informations requises afin
//qu'une note de frais soit valide
describe("Given I am connected as an employee on NewBill page", () => {
  describe("When I am on NewBill page in order to send a New Bill", () => {
    beforeEach(() => {
      const user = JSON.stringify({
        type: "Employee",
        email: "a@a",
      });
      window.localStorage.setItem("user", user);
      const pathname = ROUTES_PATH["NewBill"];
      Object.defineProperty(window, "location", {
        value: {
          hash: pathname,
        },
      });
      document.body.innerHTML = `<div id="root"></div>`;
      router();
    });
    test("Then the date input must be required", () => {
      const dateInput = screen.queryByTestId("datepicker");
      expect(dateInput).toBeRequired();
    });
    test("Then the amount input must be required", () => {
      const amountInput = screen.queryByTestId("amount");
      expect(amountInput).toBeRequired();
    });
    test("Then the VAT % must be required", () => {
      const VATInput = screen.queryByTestId("pct");
      expect(VATInput).toBeRequired();
    });
    test("Then the proof file must be required", () => {
      const fileInput = screen.queryByTestId("file");
      expect(fileInput).toBeRequired();
    });
  });

  // Ajout TEST EXTENSION DE FICHIER du TO DO 3 - BUG HUNT Bills
  //Voir Containers - NewBill
  describe("When I submit a wrong file extension to validate the bill form", () => {
    test("Then an alert inviting the employee to upload the correct file extension appears", () => {
      /*
    Code origine : 
    const html = NewBillUI()
    document.body.innerHTML = html
    to-do write assertion
     */
      window.alert.mockClear();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const user = JSON.stringify({
        type: "Employee",
        email: "a@a",
      });
      window.localStorage.setItem("user", user);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const newBillInputData = {
        file: new File(["txt"], "test.txt", { type: "text/plain" }),
      };

      const fileChangeNewBill = screen.getByTestId("file");
      const handleChangeFileButton = jest.fn((e) =>
        newCreatedBill.handleChangeFile(e)
      );
      fileChangeNewBill.addEventListener("change", handleChangeFileButton);
      window.alert = jest.fn();

      userEvent.upload(fileChangeNewBill, newBillInputData.file);
      expect(handleChangeFileButton).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
      expect(fileChangeNewBill.value).toBe("");
    });
  });

  //TO DO 5 : Ajout test Envoi du formulaire avec certains
  //champs manquants
  describe("When I submit the form with missing fields", () => {
    test("Then I am remaining on the NewBill page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const user = JSON.stringify({
        type: "Employee",
        email: "a@a",
      });
      window.localStorage.setItem("user", user);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const newBillDateInput = screen.getByTestId("datepicker");
      expect(newBillDateInput.innerHTML).toBe("");
      const newBillIAmountInput = screen.getByTestId("amount");
      expect(newBillIAmountInput.innerHTML).toBe("");
      const newBillPercentInput = screen.getByTestId("pct");
      expect(newBillPercentInput.innerHTML).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled();

      const newBillTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillTitle).toBeTruthy();
    });
  });

  //TO DO 5 : Ajout test Envoi du formulaire
  //champs requis complétés
  //renvoi page d'accueil
  describe("When all inputs are filled while sending the form", () => {
    test("Then the form is submitted and I am redirected on Bills page", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const user = JSON.stringify({
        type: "Employee",
        email: "a@a",
      });
      window.localStorage.setItem("user", user);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const newBillInputData = {
        date: "2022-06-07",
        amount: "100",
        pct: "20",
        file: new File(["img"], "test_newbill.png", { type: "image/png" }),
      };

      const newBillDateInput = screen.getByTestId("datepicker");
      fireEvent.change(newBillDateInput, {
        target: { value: newBillInputData.date },
      });
      expect(newBillDateInput.value).toBe(newBillInputData.date);

      const newBillIAmountInput = screen.getByTestId("amount");
      fireEvent.change(newBillIAmountInput, {
        target: { value: newBillInputData.amount },
      });
      expect(newBillIAmountInput.value).toBe(newBillInputData.amount);

      const newBillPercentInput = screen.getByTestId("pct");
      fireEvent.change(newBillPercentInput, {
        target: { value: newBillInputData.pct },
      });
      expect(newBillPercentInput.value).toBe(newBillInputData.pct);

      const fileChangeNewBill = screen.getByTestId("file");
      const handleChangeFileButton = jest.fn((e) =>
        newCreatedBill.handleChangeFile(e)
      );
      fileChangeNewBill.addEventListener("change", handleChangeFileButton);
      userEvent.upload(fileChangeNewBill, newBillInputData.file);
      expect(handleChangeFileButton).toHaveBeenCalled();
      expect(fileChangeNewBill.files[0]).toBe(newBillInputData.file);
      expect(fileChangeNewBill.files.item(0)).toBe(newBillInputData.file);
      expect(fileChangeNewBill.files).toHaveLength(1);

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) =>
        newCreatedBill.handleSubmit(e)
      );
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled();

      await new Promise(process.nextTick);
      const billsTitle = screen.getByText("Mes notes de frais");
      expect(billsTitle).toBeTruthy();
      const billsTableBody = screen.getByTestId("tbody");
      expect(billsTableBody).toBeTruthy();
    });
  });
});
