const getOneItemButton = document.querySelector(".getOneItemButton");
const getAllItemsButton = document.querySelector(".getAllItemsButton");
const findItemIdInput = document.querySelector("#findItemIdInput");
const allItemsResult = document.querySelector(".allItemsResult");
const singleItemResult = document.querySelector(".singleItemResult");
const errorMessageItem = document.querySelector(".errorMessageItem");
const addSingleItemButton = document.querySelector(".addSingleItemButton");
const newSingleItemElement = document.querySelector(".newSingleItemElement");

const maxAmountOfApiItems = 12;

class HttpService {
    async makeRequest(apiPath, params = {}, methodType = "GET") {
        const query = Object.entries(params)
            .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
            .join("&");
        const url = query ? `${apiPath}?${query}` : apiPath;

        const options = {
            method: methodType.toUpperCase(),
            headers: { "Content-Type": "application/json" },
            body: methodType.toUpperCase() === "GET" ? undefined : JSON.stringify(params),
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const parsedResponse = await response.json();
        return parsedResponse.data ?? parsedResponse;
    }
}

class Worker{
    constructor() {
        this.httpService = new HttpService()
        this.getAllApiPath = "https://reqres.in/api/users";
        this.getOneApiPath = "https://reqres.in/api/users/:id";
        this.createOneApiPath = "https://reqres.in/api/users";
        this.state = [];
    }

    async getOne(id) {
        const existingItem = this.state.find((item) => item.id === id);
        if (existingItem) {
            return existingItem;
        }
        return await this.httpService.makeRequest(this.getOneApiPath.replace(":id", id), {id});
    }

    async getAll() {
        if(this.state.length === 0){
            this.state = await this.httpService.makeRequest(this.getAllApiPath);
        }
        return this.state;
    }

    async createOne() {
        const id = Math.floor(Math.random() * 10000);
        const newItem = {
            id,
            email: `dummy_email_${id}`
        };
        this.state.push(newItem);
        return this.httpService.makeRequest(this.createOneApiPath, newItem, "POST");
    }
}

class UserInterfaceHandler {
    static renderAllItemsOnPage(items) {
        allItemsResult.textContent = JSON.stringify(items.map(item => ({
            id: item.id,
            email: item.email
        })))
    }

    static renderOneItemOnPage(item = {}) {
        const { email, id } = item
        singleItemResult.textContent = JSON.stringify({ email, id })
    }

    static renderCreatedItemOnPage(item) {
        newSingleItemElement.textContent = JSON.stringify(item)
    }

    static setErrorMessage(msg) {
        errorMessageItem.textContent = msg
    }
}

class EventHandler {
    constructor() {
        this.worker = new Worker();
        this.data = "";
        this.bindEvents();
    }

    bindEvents() {
        throw new Error('Method bindEvents must be implemented by child class');
    }

    async handleGetAllItemsClick(e) {
        this.data = await this.worker.getAll();
        UserInterfaceHandler.renderAllItemsOnPage(this.data);
    }

    async handleGetOneItemClick(e) {
        const id = findItemIdInput.value;

        if (!id) {
            UserInterfaceHandler.setErrorMessage("Id should not be empty");
            UserInterfaceHandler.renderOneItemOnPage({})
            return;
        } else if (id <= 0 || id > maxAmountOfApiItems) {
            UserInterfaceHandler.setErrorMessage("Id should be between 1 and 12");
            UserInterfaceHandler.renderOneItemOnPage({})
            return;
        }

        this.data = await this.worker.getOne(id);
        UserInterfaceHandler.setErrorMessage("");
        UserInterfaceHandler.renderOneItemOnPage(this.data);
    }

    async handleAddSingleItemClick(e) {
        try {
            this.data = await this.worker.createOne();
            UserInterfaceHandler.renderCreatedItemOnPage(this.data);
        } catch (error) {
            console.error('There was a problem adding the item:', error);
        }
    }
}

class ItemEventHandler extends EventHandler {
    bindEvents() {
        getAllItemsButton.addEventListener("click", this.handleGetAllItemsClick.bind(this));
        getOneItemButton.addEventListener("click", this.handleGetOneItemClick.bind(this));
        addSingleItemButton.addEventListener("click", this.handleAddSingleItemClick.bind(this));
    }
}

new ItemEventHandler().bindEvents()