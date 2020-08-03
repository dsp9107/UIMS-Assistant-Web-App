const functions = require("firebase-functions");
const puppeteer = require("puppeteer");
const crypto = require("crypto");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.ping = functions
    .region("asia-east2")
    .https.onRequest((request, response) => {
        return response.send("pongy");
    });

// ACTUAL LOGIC STARTS HERE

let browser, page;

function shortenSubjectName(subName) {
    var splitz = subName.split(" ");
    var subShort = "";

    splitz.forEach((part) => {
        if (part == "LAB") {
            subShort += " Lab";
        } else if (part == "AND") {
        } else {
            subShort += part[0];
        }
    });

    return subShort;
}

function hashIt(hashee) {
    try {
        var hashed = crypto
            .createHash("md5")
            .update(JSON.stringify(hashee))
            .digest("hex");
        return hashed;
    } catch (e) {
        console.log("CRYPTO -", e);
        return null;
    }
}

async function openBrowserMinimal() {
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"],
        });
        page = await browser.newPage();
        await page.setViewport({ width: 640, height: 480 });
        await page.setRequestInterception(true);

        page.on("request", (req) => {
            if (
                req.resourceType() === "stylesheet" ||
                req.resourceType() === "font" ||
                req.resourceType() === "image"
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return Promise.resolve(true);
    } catch (e) {
        console.log("PPTR -", e);
        return new Error("Some issue with Puppeteer");
    }
}

async function goToUIMS() {
    try {
        if (
            page.url() != "https://uims.cuchd.in/uims/" &&
            page.url() != "https://uims.cuchd.in/UIMS/Login.aspx"
        ) {
            await page
                .goto("https://uims.cuchd.in/uims/")
                .catch((e) => console.log(e.message));
            await page.waitForSelector(".login-form");
            return Promise.resolve(true);
        } else {
            return new Error("Unable to open UIMS");
        }
    } catch (e) {
        console.log("PPTR -", e.message);
        throw e;
    }
}

async function loginToUIMS(user) {
    try {
        // type in username
        await page.waitForSelector("#txtUserId");
        await page.type("#txtUserId", user.uid);

        await page.click("#btnNext");

        // type in password
        await page.waitForSelector("#txtLoginPassword");
        await page.type("#txtLoginPassword", user.pass);

        await page.click("#btnLogin");

        // check if logged in
        if (page.url().indexOf("https://uims.cuchd.in/uims/Login.aspx") == 0) {
            await page.waitForSelector(
                "#login-page > div:nth-child(3) > div.sweet-alert.showSweetAlert.visible > p"
            );
            var errorMsg = await page.$eval(
                "#login-page > div:nth-child(3) > div.sweet-alert.showSweetAlert.visible > p",
                (element) => element.innerText
            );
            if (errorMsg === "UserId or Password InCorrect") {
                throw new Error("Incorrect UIMS Credentials");
            } else {
                throw new Error("Unable to login");
            }
        } else {
            console.log("UIMS - User logged in");
            return Promise.resolve(true);
        }
    } catch (e) {
        console.log("UIMS -", e.message);
        throw e;
    }
}

async function logoutFromUIMS() {
    try {
        if (
            page.url() !=
            "https://uims.cuchd.in/UIMS/frmStudentCourseWiseAttendanceSummary.aspx"
        ) {
            await page.goto(
                "https://uims.cuchd.in/UIMS/frmStudentCourseWiseAttendanceSummary.aspx",
                { waitUntil: "domcontentloaded" }
            );
        }
        if (
            page.url() ===
            "https://uims.cuchd.in/UIMS/frmStudentCourseWiseAttendanceSummary.aspx"
        ) {
            await page.click(
                "#header > div.header-right.pull-right > div > div.home-links > ul > li:nth-child(2) > div > ul > li:nth-child(3) > a"
            );
            console.log("UIMS - User logged out");
        }
    } catch (e) {
        console.log("UIMS -", e.message);
    }
}

async function scrapeAttendance() {
    try {
        await page.goto(
            "https://uims.cuchd.in/UIMS/frmStudentCourseWiseAttendanceSummary.aspx",
            { waitUntil: "domcontentloaded" }
        );

        // data loads dynamically after the DOM has loaded, that's why, can't just rely on the above waitUntil
        await page.waitForFunction(
            'document.getElementById("SortTable").rows.length > 1'
        );

        // magic happens here
        let rezult = await page.evaluate(() => {
            let keys = [],
                data = [];
            $("tr")
                .find("th")
                .each(function () {
                    if ($(this).text() != "View Attendance") {
                        keys.push($(this).text());
                    }
                });
            $("tr").each(function () {
                temp = [];
                $(this)
                    .find("td")
                    .each(function () {
                        if ($(this).text() != "") {
                            temp.push($(this).text());
                        }
                    });
                if (temp.length > 0) {
                    data.push(temp);
                }
            });
            return { keys, data };
        });

        return Promise.resolve(rezult);
    } catch (e) {
        console.log("PPTR -", e);
        throw new Error("Unable to scrape Attendance");
    }
}

function prepStageOne(rezult) {
    return new Promise(function (resolve, reject) {
        let internalData = [];
        internalData.push(rezult.keys);
        rezult.data.forEach((d) => {
            internalData.push(d);
        });

        resolve({
            data: internalData,
            desc: "data",
            version: 1,
        });
    });
}

function prepStageTwo(stageOneData) {
    return new Promise(function (resolve, reject) {
        let cleaned = [];
        for (let index = 1; index < stageOneData.data.length; index++) {
            const sub = stageOneData.data[index];
            var cleanedSub = {
                subject: {
                    code: sub[0],
                    title: sub[1].toUpperCase(),
                    short: shortenSubjectName(sub[1].toUpperCase()),
                },
                attendance: {
                    total: { delv: sub[2], attd: sub[3] },
                    leaves: {
                        dl: { np: sub[4], o: sub[5] },
                        ml: sub[6],
                    },
                    eligible: { delv: sub[7], attd: sub[8], perc: sub[9] },
                },
            };
            cleaned.push(cleanedSub);
        }
        resolve({
            data: cleaned,
            desc: "data",
            md5: hashIt(cleaned),
            version: 2,
        });
    });
}

exports.updateCredsUIMS = functions
    .region("us-central1")
    .runWith({ timeoutSeconds: 30, memory: "128MB" })
    .https.onCall(async (data, context) => {
        if (context.auth && context.auth.uid) {
            await db
                .collection("users")
                .doc(context.auth.uid)
                .set({ "uims-creds": { uid: data.uid, pass: data.pass } });
            return true;
        } else return false;
    });

exports.fetchAttendanceV2 = functions
    .region("us-central1")
    .runWith({ timeoutSeconds: 30, memory: "512MB" })
    .https.onCall(async (data, context) => {
        if (context.auth && context.auth.uid) {
            return db
                .collection("users")
                .doc(context.auth.uid)
                .get()
                .then((doc) => {
                    if (!doc.exists) {
                        return {
                            desc: "error",
                            error: "uims creds not updated",
                        };
                    } else {
                        var uimsCreds = doc.data()["uims-creds"];
                        return openBrowserMinimal()
                            .then(goToUIMS)
                            .then(() => {
                                return loginToUIMS({
                                    uid: uimsCreds.uid,
                                    pass: uimsCreds.pass,
                                });
                            })
                            .then(scrapeAttendance)
                            .then((scrapedData) => {
                                logoutFromUIMS();
                                return prepStageOne(scrapedData);
                            })
                            .then((stageOnePrepped) =>
                                prepStageTwo(stageOnePrepped)
                            )
                            .then((stageTwoPrepped) => {
                                return stageTwoPrepped;
                            })
                            .catch((e) => {
                                if (
                                    e.message === "Some issue with Puppeteer" ||
                                    e.message === "Unable to open UIMS" ||
                                    e.message ===
                                        "Incorrect UIMS Credentials" ||
                                    e.message === "Unable to login" ||
                                    e.message === "Unable to scrape Attendance"
                                ) {
                                    return { desc: "error", error: e.message };
                                }
                                console.log(e);
                            });
                    }
                })
                .catch((e) => {
                    return { desc: "error", error: "uims creds not updated" };
                });
        } else
            return { desc: "error", error: "you're not supposed to do that" };
    });
