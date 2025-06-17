function fetcharea(cityId) {
  if (!cityId) return;

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `/getareadata?city_id=${cityId}`, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      const areaSelect = document.getElementById("area");
      areaSelect.innerHTML = `<option value="">-- Select Area --</option>`;

      data.forEach((area) => {
        const option = document.createElement("option");
        option.value = area.area_id;
        option.textContent = area.area_name;
        areaSelect.appendChild(option);
      });
    } else {
      const areaSelect = document.getElementById("area");
      areaSelect.innerHTML = `<option value="">-- No area present --</option>`;
      console.error("Failed to fetch areas:", xhr.status);
      alert("No area present for city ");
    }
  };

  xhr.onerror = function () {
    console.error("XHR error occurred.");
    alert("Network error");
  };

  xhr.send();
}
