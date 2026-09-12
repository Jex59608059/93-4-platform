document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const calendarGrid = document.querySelector('.calendar-grid');
    const colleagueSelect = document.getElementById('colleagueSelect');

    let currentDate = new Date(); // 初始化為當前日期
    let calendarData = {}; // 用於儲存處理後的月曆資料
    // allColleagues 將不再用於填充選單，但仍用於處理從 JSON 獲取的資料
    let allColleagues = new Set(); // 仍用於收集所有同事，但不會直接用於選單填充

    const DATA_URL = 'https://script.google.com/macros/s/AKfycbxSSi0lgqHVOkeUDRbo8h6zGeUOY9fwYL72o_IJDGcJ3poCYkD-JGjz-dvUAW_qK3n9/exec';

    // --- 1. 從 API 獲取資料並處理 ---
    async function fetchData() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            processData(data);
            populateColleagueSelect(); // 填充同事選單
            renderCalendar(); // 資料載入並處理後，渲染月曆
        } catch (error) {
            console.error('Error fetching or processing data:', error);
            currentMonthYearDisplay.textContent = '載入資料失敗。';
        }
    }

    // --- 2. 處理資料：將原始 JSON 轉換為易於查詢的結構 ---
    function processData(rawData) {
        calendarData = {}; // 重置資料
        allColleagues.clear(); // 清除舊的同事列表，雖然選單不再依賴它，但用於內部資料結構完整性

        rawData.forEach(item => {
            const dateObj = new Date(item.date);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1; // getMonth() 是 0-11
            const day = dateObj.getDate();
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            // 注意：這裡不主動排除 "test" 的數據。
            // 這是因為即使 "test" 不在選單中，如果數據中存在 "test" 的記錄，
            // 當選單選擇 "所有同事" 時，這些數據仍然應該被處理和計入。
            // 只有在選單填充時，我們才排除 "test"。

            if (!calendarData[formattedDate]) {
                calendarData[formattedDate] = {};
            }
            if (!calendarData[formattedDate][item.person]) {
                calendarData[formattedDate][item.person] = [];
            }
            calendarData[formattedDate][item.person].push({
                shift: item.shift,
                room: item.room,
                source: item.source
            });
            allColleagues.add(item.person); // 收集所有同事姓名 (用於內部資料處理，不直接用於選單填充)
        });
        console.log("Processed Calendar Data:", calendarData); // 檢查處理後的資料
    }

    // --- 3. 填充同事選單 (手動指定列表，並排除 "test") ---
    function populateColleagueSelect() {
        colleagueSelect.innerHTML = '<option value="">所有同事</option>'; // 重置選單

        // **** 在這裡手動控制同事列表，並排除 "test" ****
        const myCustomColleagues = [
            "44000 馮榮祥",
            "52661 林慧玲",
            "89866 黃雅羚",
            "93600 黃品婕",
            "140622 邱重臻",
            "145984 蕭崇成",
            "161714 李杰叡",
            "180256 黃致穎",
            "182380 林軒星",
            "182545 梁瀞文",
            "182560 謝秉珊",
            "182657 吳宜錚",
            "182787 林俐瑩",
            "183319 趙祥安",
            "183327 高承鴻",
            "183492 洪珦芫",
            "183874 巫俞萱",
            
            
            "184702 許馨予",
            "185026 呂承祐",
            "185353 盧奕同",
            "185377 李享叡",
            
            
            "185635 曾彥綾",
            
            "185882 劉子齊",
            "185435 吳沂儒",
            "185543 黃婉琦",
            "185544 賴映妤",
            "185746 廖紫聿",
            "186014 鄭可萱",
            "186463 鄭冠彥",
            "186248 李政佑",
            "186481 羅于捷",
            "留空備用"   // 範例：新增另一個同事
        ];

        // 過濾掉你不想顯示的同事，例如 "test"
        const filteredColleagues = myCustomColleagues.filter(colleague => colleague !== "test");

        // 如果你希望這些手動指定的同事也保持排序
        const sortedColleagues = filteredColleagues.sort();

        sortedColleagues.forEach(colleague => {
            const option = document.createElement('option');
            option.value = colleague;
            option.textContent = colleague;
            colleagueSelect.appendChild(option);
        });
        // ************************************
    }

    function renderCalendar() {
        calendarGrid.querySelectorAll('.date-cell').forEach(cell => cell.remove()); // 清除舊的日期單元格

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-11
        const today = new Date();
        const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;


        currentMonthYearDisplay.textContent = `${year} 年 ${month + 1} 月`;

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 當月第一天是星期幾
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 當月有多少天
        const daysInPrevMonth = new Date(year, month, 0).getDate(); // 上個月有多少天

        // 渲染上個月的日期 (灰色)
        for (let i = firstDayOfMonth; i > 0; i--) {
            const date = daysInPrevMonth - i + 1;
            const cell = createDateCell(date, 'other-month');
            calendarGrid.appendChild(cell);
        }

        // 渲染本月的日期
        for (let i = 1; i <= daysInMonth; i++) {
            const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const cell = createDateCell(i, '', formattedDate);

            // 檢查是否是今天
            if (formattedDate === todayString) {
                cell.classList.add('today');
            }

            // --- 顯示資料 ---
            const selectedColleague = colleagueSelect.value;
            const dateRecords = calendarData[formattedDate];

            // 只有當有該日期的紀錄且選定了特定同事 (非空字串) 時才處理
            if (dateRecords && selectedColleague) {
                const dataDisplayDiv = document.createElement('div');
                dataDisplayDiv.classList.add('data-entry');

                const colleagueRecords = dateRecords[selectedColleague]; // 獲取該同事在該日期的所有紀錄

                let displayHtml = '';
                if (colleagueRecords && colleagueRecords.length > 0) {
                    // 過濾出不重複的 source 資訊
                    const uniqueSources = new Set();
                    colleagueRecords.forEach(record => {
                        if (record.source) {
                            uniqueSources.add(record.source);
                        }
                    });

                    // 為每個唯一的 source 創建一個 div
                    uniqueSources.forEach(source => {
                        displayHtml += `<div>${source}</div>`;
                    });
                }
                // 如果沒有紀錄，displayHtml 會是空的，不會顯示任何內容，符合 "若無資訊則空白"

                dataDisplayDiv.innerHTML = displayHtml;
                cell.appendChild(dataDisplayDiv);
            }
            // 如果 selectedColleague 是 "所有同事" (即空字串)，或者該日期沒有任何紀錄，
            // 則 dataDisplayDiv 不會被創建或填充，方格保持空白，符合 "若無資訊則空白"

            calendarGrid.appendChild(cell);
        }

        // 渲染下個月的日期 (灰色)，填補剩餘空間
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remainingCells; i++) {
            const cell = createDateCell(i, 'other-month');
            calendarGrid.appendChild(cell);
        }
    }

    function createDateCell(dateNum, className = '', fullDateString = '') {
        const cell = document.createElement('div');
        cell.classList.add('date-cell');
        if (className) {
            cell.classList.add(className);
        }
        cell.dataset.fullDate = fullDateString; // 儲存完整日期字串

        const dateNumber = document.createElement('div');
        dateNumber.classList.add('date-number');
        dateNumber.textContent = dateNum;
        cell.appendChild(dateNumber);

        return cell;
    }

    // 事件監聽器
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    colleagueSelect.addEventListener('change', () => {
        // 當同事選擇改變時，重新渲染月曆以更新資料顯示
        renderCalendar();
    });

    // 頁面載入時，首先獲取資料並初始化月曆
    fetchData();
});