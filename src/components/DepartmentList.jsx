```jsx
import React from 'react';

function DepartmentList({ departments }) {
  return (
    <div>
      <h2>Departments</h2>
      <ul>
        {departments.map(department => (
          <li key={department.id}>{department.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default DepartmentList;
```
