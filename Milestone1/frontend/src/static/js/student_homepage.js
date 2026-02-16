const join = document.getElementById("join");
join.addEventListener("keyup", (e) => {

  if (e.key === 'Enter') {
    const courseList = document.getElementById("course-list");
    const newCourse = document.createElement("div");
    newCourse.id = "course";
    const text = document.createElement("p");
    text.textContent = "placeholder course";
    newCourse.appendChild(text);

    courseList.appendChild(newCourse);

  }

});
