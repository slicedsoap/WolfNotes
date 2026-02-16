const form = document.getElementById("create_course_form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Collects the information inputted by instructor
  const course_title = document.getElementById("create_course_title").value;
  const course_name = document.getElementById("create_course_name").value;
  const course_role = document.getElementById("create_course_role").value;
  const course_section = document.getElementById("create_course_section").value;

  // The parent div to store all the classes in (displays the courses the instructor added)
  const instructor_div = document.querySelector(".instructor_courses");

  // Creates the elements to display in a card indicating courses added by instructor
  const add_course_title = document.createElement("h2");
  add_course_title.textContent = course_title;

  const add_course_name = document.createElement("p");
  add_course_name.textContent = `Name: ${course_name}`;

  const add_course_section = document.createElement("p");
  add_course_section.textContent = `Section: ${course_section}`;

  const add_course_role = document.createElement("p");
  add_course_role.textContent = `Role: ${course_role}`;

  // Child container indicating each course added by instructor
  const courseCard = document.createElement("div");
  courseCard.classList.add("course-card");
  courseCard.appendChild(add_course_title);
  courseCard.appendChild(add_course_name);
  courseCard.appendChild(add_course_section);
  courseCard.appendChild(add_course_role);

  // Append to instructor section
  instructor_div.appendChild(courseCard);
  form.reset();
});
