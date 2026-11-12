/**
 * Rebook participant modal functionality
 * Displays available slots for rebooking a participant to
 */

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('rebook-participant-modal');
  const rebookButtons = document.querySelectorAll('.rebook-btn');
  const slotsTable = document.getElementById('rebook-slots-tbody');
  
  // Store the row being rebooked for later use
  let currentRebookingRow = null;

  rebookButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the row data
      const row = this.closest('tr');
      const participantCell = row.querySelector('td:nth-child(2)');
      
      // Store the original row for later use
      currentRebookingRow = row;
      
      // Extract participant info
      const participantLink = participantCell.querySelector('a');
      const participantName = participantLink ? participantLink.textContent.trim() : 'Participant';
      
      // Update modal title
      document.getElementById('rebook-modal-title').textContent = 
        `Rebook ${participantName} to available slot`;
      
      // Populate slots table
      populateAvailableSlots();
      
      // Show modal using popover API
      if (modal.showPopover) {
        modal.showPopover();
      } else {
        modal.style.display = 'block';
      }
    });
  });

  function populateAvailableSlots() {
    // Clear existing rows
    slotsTable.innerHTML = '';
    
    // Get all slots from the main table
    const mainTable = document.querySelector('.app-participant-table tbody');
    const allRows = mainTable.querySelectorAll('tr');
    
    // Build slots array with their status
    const slots = [];
    
    allRows.forEach(row => {
      const timeCell = row.querySelector('td:first-child');
      if (!timeCell) return;
      
      // Extract time text - clean up the format
      const timeText = timeCell.textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      // Determine slot status
      const slotData = determineSlotStatus(row);
      
      slots.push({
        time: timeText,
        status: slotData.status,
        statusTag: slotData.statusTag,
        available: slotData.available,
        additionalTags: slotData.additionalTags,
        notes: slotData.notes
      });
    });
    
    // Add rows to the modal table
    slots.forEach(slot => {
      const row = document.createElement('tr');
      row.className = 'nhsuk-table__row';
      
      if (!slot.available) {
        row.classList.add('app-slot-unavailable');
      }
      
      const timeHtml = `<td class="nhsuk-table__cell app-column-time">${escapeHtml(slot.time)}</td>`;
      
      // Build status cell with main tag
      let statusHtml = `<td class="nhsuk-table__cell app-slot-status">
        <span class="nhsuk-tag nhsuk-tag--${escapeHtml(slot.statusTag || 'grey')}">
          ${escapeHtml(slot.status)}
        </span>`;
      
      // Add additional tags (e.g., Special appointment)
      if (slot.additionalTags && slot.additionalTags.length > 0) {
        slot.additionalTags.forEach(tag => {
          statusHtml += `<span class="nhsuk-tag nhsuk-tag--${escapeHtml(tag.color)}">
            ${escapeHtml(tag.text)}
          </span>`;
        });
      }
      
      // Add notes if present
      if (slot.notes) {
        statusHtml += `<div class="nhsuk-u-secondary-text-colour nhsuk-u-font-size-16 nhsuk-u-margin-top-2">
          ${escapeHtml(slot.notes)}
        </div>`;
      }
      
      statusHtml += `</td>`;
      
      let actionHtml = '';
      if (slot.available) {
        actionHtml = `<td class="nhsuk-table__cell app-slot-action">
          <button type="button" class="app-slot-rebook-link" data-slot="${escapeHtml(slot.time)}">
            Rebook to this slot
          </button>
        </td>`;
      } else {
        actionHtml = `<td class="nhsuk-table__cell app-slot-action">
          <span class="nhsuk-u-secondary-text-colour">Not available</span>
        </td>`;
      }
      
      row.innerHTML = timeHtml + statusHtml + actionHtml;
      slotsTable.appendChild(row);
      
      // Add event listener to rebook buttons
      if (slot.available) {
        const rebookLink = row.querySelector('.app-slot-rebook-link');
        rebookLink.addEventListener('click', function(e) {
          e.preventDefault();
          handleRebookToSlot(slot.time);
        });
      }
    });
  }

  function determineSlotStatus(row) {
    // Look for tags that indicate status
    const tags = row.querySelectorAll('.nhsuk-tag');
    const tagTexts = Array.from(tags).map(t => t.textContent.trim());
    const tagColors = Array.from(tags).map(t => {
      const classList = Array.from(t.classList);
      const colorClass = classList.find(c => c.startsWith('nhsuk-tag--'));
      return colorClass ? colorClass.replace('nhsuk-tag--', '') : 'grey';
    });
    
    // Extract additional tags (special appointment, hold type, etc.) excluding status tags
    const additionalTags = [];
    tagTexts.forEach((text, index) => {
      const color = tagColors[index];
      // Only include meaningful additional tags like "Special appointment"
      if (!['Held', 'Available', 'Staff break'].includes(text) && 
          !text.match(/^\d+\s+slots?$/) &&
          !text.match(/^hold type$/) &&
          text !== '') {
        if (color === 'yellow') {
          additionalTags.push({ text, color: 'yellow' });
        }
      }
    });
    
    // Extract notes from secondary-text-colour div (but exclude NHS number, age, and time ranges)
    let notes = null;
    const secondarytextDivs = row.querySelectorAll('.nhsuk-u-secondary-text-colour.nhsuk-u-font-size-16');
    secondarytextDivs.forEach(div => {
      const text = div.textContent.trim();
      // Only include if it looks like a note (not NHS number, age, or time range like "to HH:MM")
      if (text && 
          !text.includes('NHS:') && 
          !text.includes('years') && 
          !text.match(/^\(\d+\s+years\)$/) &&
          !text.match(/^to\s+\d{1,2}:\d{2}$/)) {
        notes = text;
      }
    });

    
    // Check for Available (has green tag and app-container-available class)
    if (row.classList.contains('app-container-available')) {
      return {
        status: 'Available',
        statusTag: 'green',
        available: true,
        additionalTags,
        notes
      };
    }
    
    // Check for Held (orange tag)
    if (tagTexts.includes('Held')) {
      return {
        status: 'Held',
        statusTag: 'orange',
        available: true,
        additionalTags,
        notes
      };
    }
    
    // Check for Staff break (grey tag)
    if (tagTexts.includes('Staff break')) {
      return {
        status: 'Staff break',
        statusTag: 'grey',
        available: false,
        additionalTags: [],
        notes: null
      };
    }
    
    // Check if slot has a participant booked (has a participant link in second cell)
    const secondCell = row.querySelector('td:nth-child(2)');
    if (secondCell) {
      const participantLink = secondCell.querySelector('a');
      // If there's a participant link that's not an action link (Rebook, Release, Book)
      if (participantLink && 
          !participantLink.textContent.includes('Rebook') &&
          !participantLink.textContent.includes('Release') &&
          !participantLink.textContent.includes('Book')) {
        return {
          status: 'Unavailable',
          statusTag: 'grey',
          available: false,
          additionalTags: [],
          notes: null
        };
      }
    }
    
    // Default to unavailable if we can't determine
    return {
      status: 'Unavailable',
      statusTag: 'grey',
      available: false,
      additionalTags: [],
      notes: null
    };
  }

  function handleRebookToSlot(slotTime) {
    if (!currentRebookingRow) {
      console.error('No participant row selected for rebooking');
      return;
    }

    // Get all rows from the main table
    const mainTable = document.querySelector('.app-participant-table tbody');
    const allRows = mainTable.querySelectorAll('tr');
    
    // Find the target slot row (the one we want to rebook to)
    let targetRow = null;
    allRows.forEach(row => {
      const timeCell = row.querySelector('td:first-child');
      if (!timeCell) return;
      
      const timeText = timeCell.textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      if (timeText === slotTime) {
        targetRow = row;
      }
    });
    
    if (!targetRow) {
      console.error('Target slot not found');
      return;
    }
    
    // Extract participant info from the original row
    const originalParticipantCell = currentRebookingRow.querySelector('td:nth-child(2)');
    const originalDobCell = currentRebookingRow.querySelector('td:nth-child(3)');
    const originalActionCell = currentRebookingRow.querySelector('td:nth-child(4)');
    const originalTimeCell = currentRebookingRow.querySelector('td:nth-child(1)');
    
    // Get the participant name for the notification
    const participantLink = originalParticipantCell.querySelector('a');
    const participantName = participantLink ? participantLink.textContent.trim() : 'Participant';
    
    // Get the participant and DOB content
    const participantContent = originalParticipantCell.innerHTML;
    const dobContent = originalDobCell.innerHTML;
    
    // Get the action button from original row
    const actionButtonHTML = originalActionCell.innerHTML;
    
    // Get target row cells
    const targetCells = Array.from(targetRow.querySelectorAll('td'));
    const targetTimeCell = targetCells[0];
    let targetParticipantCell = targetCells[1];
    let targetDobCell = null;
    let targetActionCell = targetCells[targetCells.length - 1]; // Last cell is action
    
    // Check if target row has colspan on the second cell (available/held slot structure)
    if (targetParticipantCell && targetParticipantCell.getAttribute('colspan') === '2') {
      // Need to restructure: remove colspan and split into participant + DOB cells
      const parentRow = targetParticipantCell.parentNode;
      
      // Remove the colspan cell
      parentRow.removeChild(targetParticipantCell);
      
      // Create new participant cell
      targetParticipantCell = document.createElement('td');
      targetParticipantCell.className = 'nhsuk-table__cell';
      
      // Create new DOB cell
      targetDobCell = document.createElement('td');
      targetDobCell.className = 'nhsuk-table__cell';
      
      // Insert both cells before the action cell
      parentRow.insertBefore(targetParticipantCell, targetActionCell);
      parentRow.insertBefore(targetDobCell, targetActionCell);
    } else {
      // Standard structure - get existing DOB cell
      targetDobCell = targetCells[2];
    }
    
    // Store the original target content (in case it has a participant)
    const originalTargetParticipantContent = targetParticipantCell.innerHTML;
    const originalTargetDobContent = targetDobCell ? targetDobCell.innerHTML : '';
    
    // Get the time text from target slot (needed for checkbox)
    const targetTimeText = targetTimeCell.textContent
      .replace(/\s+/g, ' ')
      .trim();
    const originalTimeText = originalTimeCell.textContent
      .replace(/\s+/g, ' ')
      .trim();
    
    // Update target row with the original participant's details
    targetParticipantCell.innerHTML = participantContent;
    if (targetDobCell) {
      targetDobCell.innerHTML = dobContent;
    }
    
    // Update the action button
    targetActionCell.innerHTML = actionButtonHTML;
    
    // Remove checkbox from target slot (if it has one - it's now booked)
    removeCheckboxFromCell(targetTimeCell);
    
    // Clear the original row's participant details
    originalParticipantCell.innerHTML = '';
    originalDobCell.innerHTML = '';
    
    // Update status tags
    // Original row should show as Available
    updateRowToAvailable(currentRebookingRow);
    
    // Target row should show as Unavailable
    updateRowToUnavailable(targetRow, originalTargetParticipantContent, originalTargetDobContent);
    
    // Add checkbox to original slot (it's now available)
    addCheckboxToCell(originalTimeCell, originalTimeText);
    
    // Close the modal
    if (modal.hidePopover) {
      modal.hidePopover();
    } else {
      modal.style.display = 'none';
    }
    
    // Show success notification
    showSuccessNotification(participantName, targetTimeText);
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear the current rebooking row
    currentRebookingRow = null;
  }

  function showSuccessNotification(participantName, slotTime) {
    const bannerWrapper = document.getElementById('rebook-success-banner');
    const notificationBanner = bannerWrapper ? bannerWrapper.querySelector('.nhsuk-notification-banner') : null;
    const message = document.getElementById('rebook-notification-message');
    
    if (!bannerWrapper || !notificationBanner || !message) return;
    
    // Set the message
    message.textContent = `${participantName} has been moved to ${slotTime}.`;
    
    // Show the banner
    bannerWrapper.style.display = 'block';
    
    // Ensure the notification banner element is focusable and focus on it
    notificationBanner.setAttribute('tabindex', '0');
    notificationBanner.focus();
    
    // Auto-hide after 12 seconds
    setTimeout(() => {
      bannerWrapper.style.display = 'none';
    }, 12000);
  }

  function removeCheckboxFromCell(timeCell) {
    // Check if cell contains a checkbox
    const checkboxItem = timeCell.querySelector('.nhsuk-checkboxes__item');
    if (checkboxItem) {
      // Replace the entire cell content with just the time text
      const checkbox = timeCell.querySelector('input[type="checkbox"]');
      const label = timeCell.querySelector('.nhsuk-checkboxes__label');
      
      if (label) {
        const timeText = label.textContent;
        timeCell.innerHTML = timeText;
      } else if (checkbox) {
        // Fallback if label not found
        timeCell.innerHTML = checkbox.value;
      }
    }
  }

  function addCheckboxToCell(timeCell, timeText) {
    // Check if cell already has a checkbox
    if (timeCell.querySelector('.nhsuk-checkboxes__item')) {
      return; // Already has checkbox
    }
    
    // Generate a unique ID for the checkbox
    const checkboxId = 'slot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create checkbox structure
    const checkboxHTML = `<div class="nhsuk-checkboxes__item">
      <input class="nhsuk-checkboxes__input" id="${escapeHtml(checkboxId)}" name="slots[]" type="checkbox" value="">
      <label class="nhsuk-label nhsuk-checkboxes__label" for="${escapeHtml(checkboxId)}">
        ${escapeHtml(timeText)}
      </label>
    </div>`;
    
    timeCell.innerHTML = checkboxHTML;
  }

  function updateRowToAvailable(row) {
    // Ensure row has the app-container-available class
    if (!row.classList.contains('app-container-available')) {
      row.classList.add('app-container-available');
    }
    
    // Clear and set up the participant cell to show Available tag
    const participantCell = row.querySelector('td:nth-child(2)');
    
    // Check if Available tag already exists
    const allTags = row.querySelectorAll('.nhsuk-tag');
    let hasAvailableTag = false;
    allTags.forEach(tag => {
      if (tag.textContent.trim() === 'Available') {
        hasAvailableTag = true;
      }
    });
    
    // Only recreate if tag doesn't exist
    if (!hasAvailableTag) {
      // Create the Available tag
      const availableSpan = document.createElement('span');
      availableSpan.className = 'nhsuk-tag nhsuk-tag--green';
      availableSpan.textContent = 'Available';
      
      participantCell.innerHTML = '';
      participantCell.appendChild(availableSpan);
    }
  }

  function updateRowToUnavailable(row, previousParticipantContent, previousDobContent) {
    // Remove the app-container-available class
    row.classList.remove('app-container-available');
    
    // The participant/DOB content has already been updated in handleRebookToSlot
    // So we don't need to do anything here - content is already in place
    // Just removing the available class is sufficient
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
});
