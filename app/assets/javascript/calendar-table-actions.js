  var lastSelectedCell = null;
  var selectableCells = Array.from(document.querySelectorAll('.calendar-table td:not(.calendar-table-no-data)'));

  function clearSelectedDays() {
    document.querySelectorAll('.calendar-table td.--date-selected').forEach(function (cell) {
      cell.classList.remove('--date-selected');
    });
  }

  document.querySelectorAll('.calendar-table').forEach(function (table) {
    table.addEventListener('click', function (event) {
      var link = event.target.closest('button, a');
      var cell = event.target.closest('td');
      var clickedScheduleName = event.target.closest('span.--schedule-name');
      var clickedStartCell = clickedScheduleName ? clickedScheduleName.closest('td.--schedule-start') : null;

      if (clickedStartCell) {
        var allCells = Array.from(document.querySelectorAll('.calendar-table td:not(.calendar-table-no-data)'));
        var startIndex = allCells.indexOf(clickedStartCell);

        if (startIndex === -1) {
          return;
        }

        var endIndex = -1;

        for (var index = startIndex + 1; index < allCells.length; index++) {
          if (allCells[index].classList.contains('--schedule-end')) {
            endIndex = index;
            break;
          }
        }

        var rangeCells = [];

        if (endIndex !== -1) {
          for (var rangeIndex = startIndex; rangeIndex <= endIndex; rangeIndex++) {
            if (allCells[rangeIndex].classList.contains('--session-assigned')) {
              rangeCells.push(allCells[rangeIndex]);
            }
          }
        } else {
          rangeCells.push(clickedStartCell);
        }

        var isAlreadySelected = rangeCells.length > 0 && rangeCells.every(function (cell) {
          return cell.classList.contains('--date-selected');
        });

        clearSelectedDays();

        if (!isAlreadySelected) {
          rangeCells.forEach(function (cell) {
            cell.classList.add('--date-selected');
          });
        }

        if (clickedScheduleName) {
          clickedScheduleName.textContent = isAlreadySelected ? 'Select schedule' : 'Deselect schedule';
        }

        lastSelectedCell = clickedStartCell;
        return;
      }

      if (link && table.contains(link)) {
        return;
      }

      if (!cell || !table.contains(cell) || cell.classList.contains('calendar-table-no-data')) {
        return;
      }

      if (event.shiftKey && lastSelectedCell) {
        var startIndex = selectableCells.indexOf(lastSelectedCell);
        var endIndex = selectableCells.indexOf(cell);

        if (startIndex !== -1 && endIndex !== -1) {
          var rangeStart = Math.min(startIndex, endIndex);
          var rangeEnd = Math.max(startIndex, endIndex);

          for (var index = rangeStart; index <= rangeEnd; index++) {
            selectableCells[index].classList.add('--date-selected');
          }
        }
      } else {
        cell.classList.toggle('--date-selected');
      }

      lastSelectedCell = cell;
    });

    table.classList.add('--js-enabled');
  });
  