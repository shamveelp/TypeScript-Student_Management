document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addStudentModal = document.getElementById('addStudentModal');
    const editStudentModal = document.getElementById('editStudentModal');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const closeButtons = document.querySelectorAll('.close, .modal-cancel');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const studentsTable = document.getElementById('studentsTable');
    const noResults = document.getElementById('noResults');
    const alertCloseBtn = document.querySelector('.alert .close-btn');
    const sortableHeaders = document.querySelectorAll('.sortable');
    
    let currentSort = {
      field: '',
      direction: 'asc'
    };
    
    // Show loading overlay
    function showLoading() {
      if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
      }
    }
    
    // Hide loading overlay
    function hideLoading() {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
    
    // Open modal
    function openModal(modal) {
      if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }
    
    // Close modal
    function closeModal(modal) {
      if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
          form.reset();
          const errorMessages = form.querySelectorAll('.error-message');
          errorMessages.forEach(msg => msg.textContent = '');
          const inputs = form.querySelectorAll('input');
          inputs.forEach(input => input.classList.remove('error'));
        }
      }
    }
    
    // Close all modals
    function closeAllModals() {
      [addStudentModal, editStudentModal, deleteConfirmModal].forEach(modal => {
        if (modal) closeModal(modal);
      });
    }
    
    // Open add student modal
    if (addStudentBtn) {
      addStudentBtn.addEventListener('click', function() {
        openModal(addStudentModal);
      });
    }
    
    // Close button for modals
    closeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        closeAllModals();
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === addStudentModal) {
        closeModal(addStudentModal);
      } else if (event.target === editStudentModal) {
        closeModal(editStudentModal);
      } else if (event.target === deleteConfirmModal) {
        closeModal(deleteConfirmModal);
      }
    });
    
    // Close alert
    if (alertCloseBtn) {
      alertCloseBtn.addEventListener('click', function() {
        const alert = this.parentElement;
        alert.style.opacity = '0';
        setTimeout(() => {
          alert.style.display = 'none';
        }, 300);
      });
    }
    
    // Handle edit button clicks
    function attachEditListeners() {
      const editButtons = document.querySelectorAll('.edit-btn');
      editButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const studentId = this.getAttribute('data-id');
          console.log('Edit button clicked for student: ' + studentId);
          
          // Show loading
          showLoading();
          
          // Fetch student data
          fetch(`/students/${studentId}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to fetch student data');
              }
              return response.json();
            })
            .then(student => {
              console.log('Student data received:', student);
              
              // Populate the edit form
              document.getElementById('editStudentId').value = student._id;
              document.getElementById('editName').value = student.name;
              document.getElementById('editAge').value = student.age;
              document.getElementById('editEmail').value = student.email;
              document.getElementById('editBatch').value = student.batch;
              document.getElementById('editCourse').value = student.course;
              
              // Update form action
              document.getElementById('editStudentForm').action = `/students/${studentId}?_method=PUT`;
              
              // Hide loading and show modal
              hideLoading();
              openModal(editStudentModal);
            })
            .catch(error => {
              console.error('Error:', error);
              hideLoading();
              alert('An error occurred while fetching student data');
            });
        });
      });
    }
    
    // Handle delete button clicks
    function attachDeleteListeners() {
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const studentId = this.getAttribute('data-id');
          document.getElementById('deleteStudentForm').action = `/students/${studentId}?_method=DELETE`;
          openModal(deleteConfirmModal);
        });
      });
    }
    
    // Initial attachment of listeners
    attachEditListeners();
    attachDeleteListeners();
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Validate each required input
        const requiredInputs = form.querySelectorAll('input[required]');
        requiredInputs.forEach(function(input) {
          const errorMessage = input.nextElementSibling;
          
          // Reset error state
          input.classList.remove('error');
          if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
          }
          
          // Check if empty
          if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            if (errorMessage) {
              errorMessage.textContent = 'This field is required';
              errorMessage.classList.add('show');
            }
          }
          
          // Validate email format
          if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
              isValid = false;
              input.classList.add('error');
              if (errorMessage) {
                errorMessage.textContent = 'Please enter a valid email address';
                errorMessage.classList.add('show');
              }
            }
          }
          
          // Validate age
          if (input.type === 'number' && input.name.includes('age')) {
            const age = parseInt(input.value);
            if (isNaN(age) || age < 15 || age > 100) {
              isValid = false;
              input.classList.add('error');
              if (errorMessage) {
                errorMessage.textContent = 'Age must be between 15 and 100';
                errorMessage.classList.add('show');
              }
            }
          }
        });
        
        if (!isValid) {
          event.preventDefault();
        } else {
          showLoading();
        }
      });
    });
    
    // Real-time search functionality
    let searchTimeout;
    
    // Add input event listener for real-time search
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(searchStudents, 300); // Debounce for 300ms
    });
    
    // Keep the click event for the search button
    searchBtn.addEventListener('click', searchStudents);
    
    async function searchStudents() {
      const query = searchInput.value.trim();
      
      try {
        showLoading();
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search students');
        }
        
        const students = await response.json();
        updateStudentsTable(students);
        
        if (currentSort.field) {
          sortTable(currentSort.field, currentSort.direction);
        }
        
        hideLoading();
      } catch (error) {
        console.error('Error:', error);
        hideLoading();
        alert('An error occurred while searching students');
      }
    }
    
    // Sorting functionality
    sortableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const field = header.dataset.field;
        
        // Remove sorting classes from all headers
        sortableHeaders.forEach(h => {
          h.classList.remove('asc', 'desc');
        });
        
        // Toggle sort direction
        if (currentSort.field === field) {
          currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.field = field;
          currentSort.direction = 'asc';
        }
        
        // Add appropriate class
        header.classList.add(currentSort.direction);
        
        // Sort the table
        sortTable(field, currentSort.direction);
      });
    });
    
    function sortTable(field, direction) {
      const tbody = studentsTable.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      const sortedRows = rows.sort((a, b) => {
        const aValue = a.children[getColumnIndex(field)].textContent;
        const bValue = b.children[getColumnIndex(field)].textContent;
        
        if (field === 'age') {
          return direction === 'asc' 
            ? parseInt(aValue) - parseInt(bValue)
            : parseInt(bValue) - parseInt(aValue);
        }
        
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
      
      // Clear the table
      tbody.innerHTML = '';
      
      // Add sorted rows
      sortedRows.forEach(row => tbody.appendChild(row));
      
      // Reattach event listeners
      attachEditListeners();
      attachDeleteListeners();
    }
    
    function getColumnIndex(field) {
      const headers = Array.from(studentsTable.querySelectorAll('th'));
      return headers.findIndex(header => header.dataset.field === field);
    }
    
    // Update students table with new data
    function updateStudentsTable(students) {
      const tbody = studentsTable.querySelector('tbody');
      tbody.innerHTML = '';
      
      if (students.length === 0) {
        studentsTable.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
      }
      
      studentsTable.classList.remove('hidden');
      noResults.classList.add('hidden');
      
      students.forEach(student => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', student._id);
        
        tr.innerHTML = `
          <td>${student.name}</td>
          <td>${student.age}</td>
          <td>${student.email}</td>
          <td>${student.batch}</td>
          <td>${student.course}</td>
          <td class="actions">
            <button class="btn-icon edit-btn" data-id="${student._id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-btn" data-id="${student._id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        
        tbody.appendChild(tr);
      });
      
      // Reattach event listeners
      attachEditListeners();
      attachDeleteListeners();
    }
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    if (alerts.length > 0) {
      setTimeout(() => {
        alerts.forEach(alert => {
          alert.style.opacity = '0';
          setTimeout(() => {
            alert.style.display = 'none';
          }, 300);
        });
      }, 5000);
    }
  });