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

// Ajout TEST EXTENSION DE FICHIER du TO DO 3 - BUG HUNT Bills
//Voir Containers - NewBill
describe("When I submit a wrong file extension to validate the bill form", () => {
  test("Then an alert inviting the employee to upload the correct file extension appears", () => {
    /*
    Code origine : 
    const html = NewBillUI()
    document.body.innerHTML = html
    to-do write assertion
    window.alert.mockClear();
    */

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
