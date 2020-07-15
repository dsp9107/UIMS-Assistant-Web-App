$(document).ready(lightItUp);

function refreshView() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
    });
    M.FloatingActionButton.getInstance($(".fixed-action-btn")).close();
    $(".tooltipped").tooltip();
    $(".instructions").hide();
    $("#loader").show();
    $("#myChart").hide();
    $(".subCardsHeader .progress").show();
    $(".moreThan90, .safeBetween, .lessThan75").empty();
    $(".moreThan90, .safeBetween, .lessThan75").hide();
    lightItUp();
}

function lightItUp() {
    let attendanceData = JSON.parse(localStorage.getItem("attendanceData"));
    if (attendanceData && attendanceData.desc == "data") {
        console.log("Local copy found. Generating reports.");
        if (attendanceData.version == 1) {
            localStorage.setItem(
                "attendanceData",
                JSON.stringify({
                    desc: "data",
                    data: cleanDataFetched(attendanceData.data),
                    version: 2,
                })
            );
            location.reload();
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
        }, 1200);
    } else {
        setTimeout(() => {
            console.log("No local copy found. Load data using the extension.");
            $("#loader").hide();
            $(".subCardsHeader").hide();
            $(".instructions").show();
        }, 1200);
    }
    // else {
    //     const fetchAttendance = functions.httpsCallable("fetchAttendance");
    //     fetchAttendance()
    //         .then((answer) => {
    //             console.log(answer);
    //             if (answer.data.desc == "data") {
    //                 console.log({ fetched: answer.data });
    //                 localStorage.setItem(
    //                     "attendanceData",
    //                     JSON.stringify({
    //                         desc: "data",
    //                         data: cleanDataFetched(answer.data.data),
    //                         version: 2,
    //                     })
    //                 );
    //                 let attendanceData = JSON.parse(
    //                     localStorage.getItem("attendanceData")
    //                 );
    //                 return attendanceData.data;
    //             } else {
    //                 alert("ERROR - check console for more details");
    //                 throw new Error(attendanceData.message);
    //             }
    //         })
    //         .then((data) => {
    //             setTimeout(() => {
    //                 generateChart(prep(data));
    //                 $("#loader").hide();
    //                 $("#myChart").show();
    //             }, 1200);
    //             setTimeout(() => {
    //                 setupSubjectCards();
    //                 $(".subCardsHeader .progress").hide();
    //                 $(".moreThan90, .safeBetween, .lessThan75").show();
    //             }, 1200);
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             console.log("contact @dsp9107");
    //         });
    // }
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
                            localStorage.getItem("attendanceData")
                        ).data[tooltipItem[0].index].subject.title;
                    },
                    label: function (tooltipItem) {
                        return `${tooltipItem.yLabel}% : attended ${
                            JSON.parse(localStorage.getItem("attendanceData"))
                                .data[tooltipItem.index].attendance.eligible
                                .attd
                        } out of ${
                            JSON.parse(localStorage.getItem("attendanceData"))
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
        s += 1;
    }
    return s;
}

function absents(a, d, p, t) {
    let s = 0;
    while (true) {
        d += 1;
        p = (a / d) * 100;
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

    JSON.parse(localStorage.getItem("attendanceData")).data.forEach((sub) => {
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
