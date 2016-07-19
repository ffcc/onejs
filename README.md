OneJS
=====
JavaScript library that adds the concept of class from Java language. Allowing the definition and extension of classes in a way conceptually similar to Java.

#How it works?
OneJS exploits the JavaScript prototype-oriented programming to generate a simple class-based system. This system allows class-based programming by defining a set of principles that allow developers to create reusable JavaScript code in a more structured way.

#Class System
##Declaration
To define a class must use the method `ONE.define`, which syntax is as follows:

```javascript
ONE.define(className, members);
```

* `className`: Full name of the class, including the namespace
* `members`: Object representing the class members, represented in the form of key-value

**Example**

```javascript
ONE.define('model.Person', {
	
	main: function(firstName, lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	},

	getFullName: function() {
		return "My full name is " + this.firstName + " " + this.lastName;
	}

});

ONE.define('model.Employee', {
	extends: model.Person,

	// @Override
	getFullName: function() {
		return this.super();
	}

});

var fulano = ONE.new(model.Person, 'Firstname', 'Lastname'); // Instantiation
var employeeFulano = ONE.new(model.Person, {
	firstName: "Employee-Firstname",
	lastName: "Employee-Lastname"
}); // Instantiation
alert(fulano.getFullName()); // alert("My full name is Firstname Lastname")
alert(employeeFulano.getFullName()); // alert("My full name is Employee-Firstname Employee-Lastname")
```
