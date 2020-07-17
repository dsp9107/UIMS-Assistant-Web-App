$(document).ready(function () {
    $(".fixed-action-btn").floatingActionButton();
    $(".tooltipped").tooltip();
    $(".modal").modal();
    var elems = document.querySelectorAll(".sidenav");
    var options = {
        edge: "left",
        draggable: true,
        inDuration: 250,
        outDuration: 200,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        preventScrolling: true,
    };
    var instances = M.Sidenav.init(elems, options);
    adjustNavbarTitle();
    return lightItUp();
});

function isChrome() {
    /*
        Browser Detection
        Thanks to https://stackoverflow.com/a/9851769
    */

    // Opera 8.0+
    var isOpera =
        (!!window.opr && !!opr.addons) ||
        !!window.opera ||
        navigator.userAgent.indexOf(" OPR/") >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== "undefined";

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari =
        /constructor/i.test(window.HTMLElement) ||
        (function (p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(
            !window.safari ||
                (typeof safari !== "undefined" && safari.pushNotification)
        );

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome =
        !!window.chrome &&
        (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;

    return (
        !isOpera &&
        !isFirefox &&
        !isSafari &&
        !isIE &&
        !isEdge &&
        isChrome &&
        !isEdgeChromium
    );
}

function refreshView() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
    });
    M.Toast.dismissAll();
    $(".tooltipped").tooltip();
    $(".instructions").hide();
    $("#loader").show();
    $("#myChart").hide();
    $(".subCardsHeader .title").hide();
    $(".subCardsHeader .progress").show();
    $(".moreThan90, .safeBetween, .lessThan75").empty();
    $(".moreThan90, .safeBetween, .lessThan75").hide();
    return lightItUp();
}

function lightItUp() {
    if (isChrome()) {
        let attendanceData = JSON.parse(
            sessionStorage.getItem("attendanceData")
        );
        if (attendanceData && attendanceData.desc == "actual") {
            console.log("Local copy found. Generating reports.");
            if (attendanceData.version == 1) {
                sessionStorage.setItem(
                    "attendanceData",
                    JSON.stringify({
                        desc: "actual",
                        data: cleanDataFetched(attendanceData.data),
                        version: 2,
                    })
                );
                return lightItUp();
            }
            setTimeout(() => {
                generateChart(prep(attendanceData.data));
                $("#loader").hide();
                $("#myChart").show();
            }, 1200);
            setTimeout(() => {
                setupSubjectCards();
                $(".subCardsHeader .progress").hide();
                $(".subCardsHeader .title").show();
                $(".moreThan90, .safeBetween, .lessThan75").show();
                M.toast({
                    html: "attendance data loaded",
                    displayLength: 3000,
                });
            }, 1200);
        } else if (attendanceData && attendanceData.desc == "demo") {
            console.log("Dummy data found. Generating reports.");
            if (attendanceData.version == 1) {
                sessionStorage.setItem(
                    "attendanceData",
                    JSON.stringify({
                        desc: "demo",
                        data: cleanDataFetched(demoAttendance.data),
                        version: 2,
                    })
                );
                return lightItUp();
            }
            setTimeout(() => {
                generateChart(prep(attendanceData.data));
                $("#loader").hide();
                $("#myChart").show();
            }, 1200);
            setTimeout(() => {
                setupSubjectCards();
                $(".subCardsHeader .progress").hide();
                $(".subCardsHeader .title").show();
                $(".moreThan90, .safeBetween, .lessThan75").show();
                M.toast({
                    html: "dummy data loaded",
                    displayLength: 3000,
                });
            }, 1200);
        } else {
            try {
                var id = "cangcekcplpijlabheaiojeddamgooeh";
                chrome.runtime.sendMessage(id, null, function (response) {
                    if (response && response.version == 1) {
                        sessionStorage.setItem(
                            "attendanceData",
                            JSON.stringify({
                                desc: "actual",
                                data: cleanDataFetched(response.data),
                                version: 2,
                            })
                        );
                        return lightItUp();
                    } else if (response && response.data == undefined) {
                        console.log(
                            "No data has been extracted. Extract data using the extension, first."
                        );
                        sessionStorage.setItem(
                            "attendanceData",
                            JSON.stringify({
                                desc: "demo",
                                data: cleanDataFetched(demoAttendance.data),
                                version: 2,
                            })
                        );
                        return lightItUp();
                    } else if (chrome.runtime.lastError) {
                        $("#download-btn").show();
                        console.log(
                            "UIMS Assistant Chrome Extension not installed. Loading dummy data."
                        );
                        sessionStorage.setItem(
                            "attendanceData",
                            JSON.stringify({
                                desc: "demo",
                                data: cleanDataFetched(demoAttendance.data),
                                version: 2,
                            })
                        );
                        return lightItUp();
                    } else {
                        $("#download-btn").show();
                        M.toast({
                            html: "check console",
                            displayLength: 3000,
                        });
                        console.log("contact @dsp9107");
                        sessionStorage.setItem(
                            "attendanceData",
                            JSON.stringify({
                                desc: "demo",
                                data: cleanDataFetched(demoAttendance.data),
                                version: 2,
                            })
                        );
                        return lightItUp();
                    }
                });
            } catch (e) {
                $("#download-btn").show();
                console.log(e);
                M.toast({
                    html: "check console",
                    displayLength: 3000,
                });
                sessionStorage.setItem(
                    "attendanceData",
                    JSON.stringify({
                        desc: "demo",
                        data: cleanDataFetched(demoAttendance.data),
                        version: 2,
                    })
                );
                return lightItUp();
            }
        }
    } else {
        let attendanceData = JSON.parse(
            sessionStorage.getItem("attendanceData")
        );
        if (attendanceData && attendanceData.version == 1) {
            sessionStorage.setItem(
                "attendanceData",
                JSON.stringify({
                    desc: "demo",
                    data: cleanDataFetched(demoAttendance.data),
                    version: 2,
                })
            );
        } else {
            sessionStorage.setItem(
                "attendanceData",
                JSON.stringify({
                    desc: "demo",
                    data: cleanDataFetched(demoAttendance.data),
                    version: 2,
                })
            );
        }
        setTimeout(() => {
            generateChart(prep(attendanceData.data));
            $("#loader").hide();
            $("#myChart").show();
        }, 1200);
        setTimeout(() => {
            setupSubjectCards();
            $(".subCardsHeader .progress").hide();
            $(".subCardsHeader .title").show();
            $(".moreThan90, .safeBetween, .lessThan75").show();
            M.toast({
                html: "dummy data loaded",
                displayLength: 3000,
            });
        }, 1200);
    }
}

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

function cleanDataFetched(attendanceData) {
    let cleaned = [];
    for (let index = 1; index < attendanceData.length; index++) {
        const sub = attendanceData[index];
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
    return cleaned;
}

function prep(attendance) {
    var labels = [],
        data = [];
    attendance.forEach((sub) => {
        labels.push(sub.subject.short);
        data.push(sub.attendance.eligible.perc);
    });

    var backgroundColor = [];
    var borderColor = [];
    for (let index = 0; index < data.length; index++) {
        let bgcolor, border;
        let opacity = parseInt(data[index] / 10) / 10;
        if (data[index] >= 90) {
            bgcolor = `rgba(0, 176, 255, ${opacity})`;
            border = `rgba(0, 176, 255, 1)`;
        } else if (data[index] >= 75) {
            bgcolor = `rgba(0, 200, 83, ${opacity})`;
            border = `rgba(0, 200, 83, 1)`;
        } else {
            bgcolor = `rgba(244, 67, 54, ${opacity})`;
            border = `rgba(244, 67, 54, 1)`;
        }
        backgroundColor.push(bgcolor);
        borderColor.push(border);
    }

    return { labels, data, backgroundColor, borderColor };
}

function generateChart(param) {
    var ctx = document.getElementById("myChart").getContext("2d");

    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: param.labels,
            datasets: [
                {
                    label: "Attendance",
                    data: param.data,
                    backgroundColor: param.backgroundColor,
                    borderColor: param.borderColor,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [
                    {
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Subjects",
                        },
                    },
                ],
                yAxes: [
                    {
                        display: true,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 25,
                            max: 100,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Eligible Percentage (%)",
                        },
                    },
                ],
            },
            tooltips: {
                xPadding: 12,
                yPadding: 12,
                displayColors: false,
                callbacks: {
                    title: function (tooltipItem) {
                        return JSON.parse(
                            sessionStorage.getItem("attendanceData")
                        ).data[tooltipItem[0].index].subject.title;
                    },
                    label: function (tooltipItem) {
                        return `${tooltipItem.yLabel}% : attended ${
                            JSON.parse(sessionStorage.getItem("attendanceData"))
                                .data[tooltipItem.index].attendance.eligible
                                .attd
                        } out of ${
                            JSON.parse(sessionStorage.getItem("attendanceData"))
                                .data[tooltipItem.index].attendance.eligible
                                .delv
                        } lectures`;
                    },
                },
            },
        },
    });
}

function presents(a, d, p, t) {
    let s = 0;
    while (p < t) {
        a += 1;
        d += 1;
        p = (a / d) * 100;
        // p = round((a / d) * 100, 2);
        s += 1;
    }
    return s;
}

function absents(a, d, p, t) {
    let s = 0;
    while (true) {
        d += 1;
        p = (a / d) * 100;
        // p = round((a / d) * 100, 2);
        if (p > t) {
            s += 1;
            continue;
        } else break;
    }
    return s;
}

function setupSubjectCards() {
    // RESET VIEW

    $(".moreThan90, .safeBetween, .lessThan75").empty();

    // LOAD DATA

    JSON.parse(sessionStorage.getItem("attendanceData")).data.forEach((sub) => {
        let a = parseInt(sub.attendance.eligible.attd, 10),
            d = parseInt(sub.attendance.eligible.delv, 10),
            p = parseInt(sub.attendance.eligible.perc, 10);
        if (p >= 90) {
            clazz = ".moreThan90";
            paint = "light-blue darken-1";

            seventyFy = absents(a, d, p, 75);
            if (seventyFy) {
                seventyFy = `can leave ${seventyFy} lecture(s)`;
            } else {
                seventyFy = `<strong>try to maintain</strong>`;
            }

            nineTee = absents(a, d, p, 90);
            if (nineTee) {
                nineTee = `can leave ${nineTee} lecture(s)`;
            } else {
                nineTee = `<strong>try to maintain</strong>`;
            }
        } else if (p >= 75) {
            clazz = ".safeBetween";
            paint = "green darken-1";

            seventyFy = absents(a, d, p, 75);
            if (seventyFy) {
                seventyFy = `can leave ${seventyFy} lecture(s)`;
            } else {
                seventyFy = `<strong>try to maintain</strong>`;
            }

            nineTee = presents(a, d, p, 90);
            if (nineTee) {
                nineTee = `behind by ${nineTee} lecture(s)`;
            } else {
                nineTee = `<strong>try to maintain</strong>`;
            }
        } else {
            clazz = ".lessThan75";
            paint = "red darken-1";
            seventyFy = `behind by ${presents(a, d, p, 75)} lectures`;
            nineTee = `behind by ${presents(a, d, p, 90)} lectures`;
        }

        $(clazz).append(`
            <div class="col s12 m4">
                <div
                    class="card-panel ${paint} tooltipped"
                    data-position="top"
                    data-tooltip="${sub.subject.title} : ${sub.attendance.eligible.perc}%"
                >
                    <span class="white-text cardCODE">${sub.subject.code} </span>
                    <br />
                    <span class="white-text cardSHORT">${sub.subject.short} </span>
                    <br /><br />
                    <span class="white-text flow-text card75">For 75% : ${seventyFy}</span>
                    <br /><br />
                    <span class="white-text flow-text card90">For 90% : ${nineTee}</span>
                </div>
            </div>
            `);
    });

    $(".moreThan90:empty, .safeBetween:empty, .lessThan75:empty").remove();

    // ATTACH HEADINGS

    if ($(".moreThan90").children().length) {
        $(".moreThan90").prepend(`
        <div class="col s12">
            <span class="flow-text">Well Above 90%</span>
        </div>`);
    }
    if ($(".safeBetween").children().length) {
        $(".safeBetween").prepend(`
    <div class="col s12">
        <span class="flow-text">Safely Above 75%</span>
    </div>`);
    }
    if ($(".lessThan75").children().length) {
        $(".lessThan75").prepend(`
    <div class="col s12">
        <span class="flow-text">Dangerously Below 75%</span>
    </div>`);
    }

    // UPDATE FUNCTIONS

    $(".tooltipped").tooltip();

    $(".card-panel.tooltipped").hover(
        function () {
            $(this).addClass("darken-2");
        },
        function () {
            $(this).removeClass("darken-2");
        }
    );
}
