// Get references to the input box and task list container
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Add a task to Firebase
function addTask() {
  const dbRef = window.db.ref("tasks"); // Use window.db to access Firebase reference
  if (inputBox.value === "") {
    alert("You must write something!!");
  } else {
    console.log("Adding task:", inputBox.value);
    dbRef.push({
      task: inputBox.value,
      checked: false,
    });
    inputBox.value = ""; // Clear the input box after adding the task
  }
}

// Listen for tasks and update the UI in real-time
function listenForTasks() {
  const dbRef = window.db.ref("tasks"); // Access Firebase reference after initialization

  dbRef.on("value", (snapshot) => {
    listContainer.innerHTML = ""; // Clear the list first to avoid duplication
    snapshot.forEach((childSnapshot) => {
      let task = childSnapshot.val(); // Get task object (task text + checked state)
      let taskKey = childSnapshot.key; // Get unique key for each task (Firebase node key)

      // Create list item for the task
      let li = document.createElement("li");
      li.innerHTML = task.task; // Set the task text
      if (task.checked) li.classList.add("checked"); // If checked, add the checked class

      // Create the remove (×) button
      let span = document.createElement("span");
      span.innerHTML = "\u00d7";
      span.setAttribute("data-key", taskKey); // Set the unique Firebase key as a data attribute on the span

      li.appendChild(span); // Append the remove button to the list item
      listContainer.appendChild(li); // Append the list item to the task list

      // Toggle the checked state of the task on click
      li.addEventListener("click", function () {
        childSnapshot.ref.update({ checked: !task.checked });
      });

      // Remove the task from Firebase when the remove button is clicked
      span.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the 'li' click event from firing

        const taskKey = this.getAttribute("data-key"); // Get the task key from the data attribute
        const taskRef = window.db.ref("tasks/" + taskKey); // Create reference to the specific task using its key

        // Remove task from the DOM immediately
        li.remove();

        // Remove task from Firebase
        taskRef
          .remove()
          .then(() => {
            console.log("Task removed successfully from Firebase");
          })
          .catch((error) => {
            console.error("Error removing task from Firebase:", error);
            // Optionally, re-add the task to the DOM if the deletion failed
            listContainer.appendChild(li);
          });
      });
    });
  });
}

// Listen for the 'Add' button click
const addButton = document.querySelector("button");
addButton.addEventListener("click", addTask);

// Listen for tasks when the page loads
listenForTasks();
