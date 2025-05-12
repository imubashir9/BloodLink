// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3001;

const mysql = require("mysql2");


app.use(cors());
app.use(bodyParser.json());

// GET dashboard data
app.get('/api/dashboard', (req, res) => {
  db.query('SELECT * FROM new_users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// PUT checked status
app.put('/api/new-users/checked', (req, res) => {
  const { id, status } = req.body;
  db.query('UPDATE new_users SET checked = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// DELETE user
app.delete('/api/dashboard/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM new_users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// POST create-donate-blood
app.post('/create-donate-blood', (req, res) => {
  const { name, email, phone, bloodType, message } = req.body;

  if (!name || !email || !phone || !bloodType) {
    return res.status(400).send('Missing required fields');
  }

  const query = `
    INSERT INTO new_users (name, email, phone, blood_type, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, phone, bloodType, message], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Database insert failed');
    }
    res.status(201).send('User added successfully');
  });
});

app.post('/create-need-help', (req, res) => {
  const { name, email, phone, reason, message } = req.body;

  db.query(
    'INSERT INTO need_help_requests (name, email, phone, reason, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, reason, message],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error saving to database.");
      }
      res.status(201).send("Need help request submitted successfully.");
    }
  );
});

app.post("/create-host-blood-drive", (req, res) => {
	const { name, email, phone, institute, designation, city, message } = req.body;

	const sql = `
        INSERT INTO host_blood_drive 
        (name, email, phone, institute, designation, city, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

	db.query(sql, [name, email, phone, institute, designation, city, message], (err, result) => {
		if (err) {
			console.error("Error inserting data:", err);
			res.status(500).send("Server error");
		} else {
			console.log("Data inserted:", result);
			res.status(200).send("Host blood drive form submitted successfully");
		}
	});
});

// ✅ Endpoint to receive need-blood requests
app.post("/create-need-blood", (req, res) => {
  const { name, email, phone, bloodType, message } = req.body;

  const sql = `
    INSERT INTO need_blood_requests (name, email, phone, blood_type, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, phone, bloodType, message], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: "Error saving request" });
    } else {
      res.status(200).json({ message: "Request saved successfully" });
    }
  });
});


// GET all donors
app.get("/api/donate-blood", (req, res) => {
  const sql = "SELECT * FROM new_users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// UPDATE 'donated' status
app.put("/api/donate-blood/donated", (req, res) => {
  const { id, status } = req.body;
  const sql = "UPDATE new_users SET donated = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Donated status updated." });
  });
});

// UPDATE donor info
app.put("/api/donate-blood/update/:id", (req, res) => {
  const id = req.params.id;
  const { name, phone, bloodType, message } = req.body.updatedData;
  const sql =
    "UPDATE new_users SET name = ?, phone = ?, bloodType = ?, message = ? WHERE id = ?";
  db.query(sql, [name, phone, bloodType, message, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Donor updated successfully." });
  });
});

// DELETE donor
app.delete("/api/donate-blood/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM new_users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Donor deleted." });
  });
});


// 1. GET all host-blood-drive entries
app.get("/api/host-blood-drive", (req, res) => {
	db.query("SELECT * FROM host_blood_drive", (err, results) => {
		if (err) return res.status(500).send(err);
		res.json(results);
	});
});

// 2. PUT update 'done' status
app.put("/api/host-blood-drive/done", (req, res) => {
	const { id, status } = req.body;
	db.query(
		"UPDATE host_blood_drive SET done = ? WHERE id = ?",
		[status, id],
		(err, results) => {
			if (err) return res.status(500).send(err);
			res.send("Status updated");
		}
	);
});

// 3. DELETE a record
app.delete("/api/host-blood-drive/delete/:id", (req, res) => {
	const { id } = req.params;
	db.query("DELETE FROM host_blood_drive WHERE id = ?", [id], (err, results) => {
		if (err) return res.status(500).send(err);
		res.send("Deleted");
	});
});

// 4. PUT update a record
app.put("/api/host-blood-drive/update/:id", (req, res) => {
	const { id } = req.params;
	const { updatedData } = req.body;

	const {
		name,
		phone,
		institute,
		designation,
		city,
		message,
	} = updatedData;

	db.query(
		`UPDATE host_blood_drive SET name=?, phone=?, institute=?, designation=?, city=?, message=? WHERE id=?`,
		[name, phone, institute, designation, city, message, id],
		(err, results) => {
			if (err) return res.status(500).send(err);
			res.send("Updated");
		}
	);
});



// Get all users who requested blood
app.get('/api/need-blood', (req, res) => {
  db.query('SELECT * FROM need_blood_requests ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results);
    }
  });
});

// Update the "given" status for a user
app.put('/api/need-blood/given', (req, res) => {
  const { status, id } = req.body;

  db.query(
    'UPDATE need_blood_requests SET given = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating data');
      } else {
        res.json({ message: 'Status updated successfully' });
      }
    }
  );
});

// Delete a user from the blood request list
app.delete('/api/need-blood/delete/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM need_blood_requests WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting data');
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});

// Update a user's information (name, phone, bloodType, message)
app.put('/api/need-blood/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, bloodType, message } = req.body.updatedData;

  db.query(
    'UPDATE need_blood_requests SET name = ?, phone = ?, bloodType = ?, message = ? WHERE id = ?',
    [name, phone, bloodType, message, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating data');
      } else {
        res.json({ message: 'User updated successfully' });
      }
    }
  );
});


// Fetch all records from the 'need_help' table
app.get('/api/need-help', (req, res) => {
    const sql = 'SELECT * FROM need_help';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// Update 'answered' status of a help request
app.put('/api/need-help/answered', (req, res) => {
    const { id, status } = req.body;
    const sql = 'UPDATE need_help_requests SET answered = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Status updated successfully' });
    });
});

// Delete a help request
app.delete('/api/need-help/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM need_help_requests WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Record deleted successfully' });
    });
});

// Update a help request
app.put('/api/need-help/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, reason, message } = req.body.updatedData;
    const sql = 'UPDATE need_help_requests SET name = ?, phone = ?, reason = ?, message = ? WHERE id = ?';
    db.query(sql, [name, phone, reason, message, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Record updated successfully' });
    });
});



// API endpoint to get dashboard data (new users, donations, etc.)
app.get('/api/dashboard', (req, res) => {
  db.query('SELECT * FROM new_users ORDER BY id DESC', (err, result) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(result);
    }
  });
});

// API endpoint to update checked status
app.put('/api/new-users/checked', (req, res) => {
  const { status, id } = req.body;
  const query = `UPDATE new_users SET checked = ? WHERE id = ?`;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Status updated successfully');
    }
  });
});

// API endpoint to delete a user
app.delete('/api/dashboard/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM new_users WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('User deleted successfully');
    }
  });
});

// // API endpoint to check blood availability
// app.get("/api/check-blood-stock", (req, res) => {
//   const bloodType = req.query.bloodType;

//   const query = "SELECT * FROM new_users WHERE blood_type = ?";
//   db.query(query, [bloodType], (err, results) => {
//     if (err) {
//       console.error("Error querying database", err);
//       return res.status(500).send("Error checking blood stock");
//     }

//     if (results.length > 0) {
//       res.json({
//         bloodType: results[0].blood_type,
//         quantityAvailable: results[0].quantity_available,
//       });
//     } else {
//       res.status(404).send("Blood type not found");
//     }
//   });
// });

// app.get('/get-blood-type-availability', (req, res) => {
//     connection.query(
//         `SELECT blood_type, COUNT(*) AS available_count 
//          FROM new_users 
//          GROUP BY blood_type`,
//         (error, results) => {
//             if (error) {
//                 return res.status(500).send({ message: 'Error fetching blood type availability', error });
//             }
//             res.json(results);
//         }
//     );
// });

//Dashboard
// GET all new_users
app.get("/api/dashboard", (req, res) => {
  const query = "SELECT * FROM new_users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// PUT update checked status for a user
app.put("/api/new-users/checked", (req, res) => {
  const { id, status } = req.body;
  const query = "UPDATE new_users SET checked = ? WHERE id = ?";
  db.query(query, [status ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Checked status updated" });
  });
});

// DELETE a user
app.delete("/api/dashboard/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM new_users WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: `User with ID ${id} deleted` });
  });
});

app.get("/get-blood-type-availability", (req, res) => {
  const sql = "SELECT blood_type FROM new_users";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
    } else {
        console.log(results);
      res.json(results); // [{ blood_type: 'A+' }, ...]
    }
  });
});


 //Admin Need Help
 // GET all need-help entries
app.get("/api/need-help", (req, res) => {
  const query = "SELECT * FROM new_users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// PUT to update 'answered' status
app.put("/api/need-help/answered", (req, res) => {
  const { id, status } = req.body;
  const query = "UPDATE new_users SET answered = ? WHERE id = ?";
  db.query(query, [status ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error("Error updating answered status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Answered status updated successfully" });
  });
});

// DELETE a record
app.delete("/api/need-help/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM new_users WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: `User with ID ${id} deleted successfully` });
  });
});

// PUT to update name, phone, reason, message
app.put("/api/need-help/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, reason, message } = req.body.updatedData;

  const query = `
    UPDATE new_users 
    SET name = ?, phone = ?, reason = ?, message = ?
    WHERE id = ?
  `;

  db.query(query, [name, phone, reason, message, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "User updated successfully" });
  });
});



//Admin-need-blood
// Get all blood requests
app.get('/api/need-blood', (req, res) => {
  const query = 'SELECT * FROM blood_requests';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
});

// Update the "given" status (PUT request)
app.put('/api/need-blood/given', (req, res) => {
  const { status, id } = req.body;
  const query = 'UPDATE blood_requests SET given = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ success: true, message: 'Status updated' });
    }
  });
});

// Delete a blood request
app.delete('/api/need-blood/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM blood_requests WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting record:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ success: true, message: 'Record deleted' });
    }
  });
});

// Update blood request information (PUT request for updating)
app.put('/api/need-blood/update/:id', (req, res) => {
  const { name, email, phone, bloodType, message } = req.body;
  const { id } = req.params;

  const query = `UPDATE blood_requests 
                 SET name = ?, email = ?, phone = ?, bloodType = ?, message = ? 
                 WHERE id = ?`;
  db.query(query, [name, email, phone, bloodType, message, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ success: true, message: 'Data updated successfully' });
    }
  });
});

//Admin host blood drive
// Get all blood drive hosts
app.get("/api/host-blood-drive", (req, res) => {
  db.query("SELECT * FROM host_blood_drive", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Update blood drive host (mark as done or not done)
app.put("/api/host-blood-drive/done", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE host_blood_drive SET done = ? WHERE id = ?",
    [status, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Status updated successfully" });
    }
  );
});

// Delete a blood drive host
app.delete("/api/host-blood-drive/delete/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM host_blood_drive WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Host deleted successfully" });
  });
});

// Update blood drive host information
app.put("/api/host-blood-drive/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, institute, designation, city, message } = req.body.updatedData;

  db.query(
    "UPDATE host_blood_drive SET name = ?, phone = ?, institute = ?, designation = ?, city = ?, message = ? WHERE id = ?",
    [name, phone, institute, designation, city, message, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Host updated successfully" });
    }
  );
});

//Admin_donate_blood
// Get all users for the Donate Blood page
app.get("/api/donate-blood", (req, res) => {
  const query = "SELECT * FROM new_users"; // Query for your `new_users` table
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

// Update the 'donated' field for a specific user
app.put("/api/donate-blood/donated", (req, res) => {
  const { status, id } = req.body;
  const query = "UPDATE new_users SET donated = ? WHERE id = ?";
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating donated status:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("Donation status updated");
  });
});

// Update user details in the 'new_users' table
app.put("/api/donate-blood/update/:id", (req, res) => {
  const { id } = req.params;
  const { updatedData } = req.body;
  const query = `
    UPDATE new_users 
    SET name = ?, phone = ?, bloodType = ?, message = ? 
    WHERE id = ?`;
  
  db.query(query, [
    updatedData.name,
    updatedData.phone,
    updatedData.bloodType,
    updatedData.message,
    id,
  ], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("User updated successfully");
  });
});

// Delete a user from the 'new_users' table
app.delete("/api/donate-blood/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM new_users WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("User deleted successfully");
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// app.post{'create-donate-blood"}