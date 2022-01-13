module.exports = {
    async checkUserRegistration(repoReg) {
        switch (repoReg) {
            case 'field':
                return 'All fields are required (name, email, password and passwordConfirmation)'
            case 'name':
                return 'Incorrect name (must be not an empty string) (f.e. Petro Petren)'
            case 'name2':
                return 'Incorrect name type (must be a string)'
            case 'name3':
                return 'Incorrect name (must be a name and a surname given separately (f.e. Petro Petren))'
            case 'email':
                return 'Incorrect email (must be not an empty string) (f.e. smth@gmail.com)'
            case 'email2':
                return 'Incorrect email type (must be a string)'
            case "email3":
                return 'Incorrect email (such email already exists)'
            case 'password':
                return 'Incorrect password (must be not an empty string) (f.e. pass1111)'
            case 'password2':
                return 'Incorrect password type (must be a string)'
            case "password3":
                return 'Password and passwordConfirmation must be equal'
            case 'confirmPassword':
                return 'Incorrect confirmPassword (must be not an empty string) (f.e. pass1111)'
            case 'confirmPassword2':
                return 'Incorrect confirmPassword type (must be a string)'
            case "user":
                return 'Incorrect user name (such name already exists)'
            default:
                return 'Some incorrect input'
        }
    },

    async checkUserAuthorization(repoAuth) {
        switch (repoAuth) {
            case 'field':
                return 'All fields are required (email and password)'
            case 'email':
                return 'Incorrect email (must be not an empty string) (f.e. smth@gmail.com)'
            case 'email2':
                return 'Incorrect email type (must be a string)'
            case "email3":
                return 'Incorrect email (user with such email doesn\'t exist)'
            case 'password':
                return 'Incorrect password (must be not an empty string) (f.e. pass1111)'
            case 'password2':
                return 'Incorrect password type (must be a string)'
            case "password3":
                return 'Incorrect password (user with such password doesn\'t exist)'
            default:
                return 'Some incorrect input'
        }
    },

    async checkAllMovies(repoMovies) {
        switch (repoMovies) {
            case 'sort':
                return 'Incorrect sort parameter'
            case "order":
                return 'Incorrect order parameter'
            case "limit":
                return 'Incorrect limit parameter (must be >= 0)'
            case "limit2":
                return 'Incorrect limit parameter (must be a number)'
            case "offset":
                return 'Incorrect offset parameter (must be >= 0)'
            case "offset2":
                return 'Incorrect offset parameter (must be a number)'
            case "actor":
                return 'Incorrect actor input (must be a name and a surname given separately (f.e. Mel Brooks))'
            case "actor2":
                return 'Actor with such credentials doesn\'t exist'
            case "movie":
                return 'Movie with such title and actor credentials in given selection doesn\'t exist'
            case "movie2":
                return 'Movie with such actor credentials in given selection doesn\'t exist'
            case "movie3":
                return 'Movie with such title in given selection doesn\'t exist'
            default:
                return 'Some incorrect input'
        }
    },

    async checkNewMovie(repoMovie) {
        switch (repoMovie) {
            case "title":
                return 'Incorrect title input (must be some title, not an empty string (f.e. Casablanca))'
            case "title2":
                return 'Incorrect title input (must be a string)'
            case "year":
                return 'Incorrect year input (must be > 0)'
            case "year2":
                return 'Incorrect year input (must be a number)'
            case "format":
                return 'Incorrect format input (must be an existing movie format (DVD, VHS or Blu-Ray), not an null value (f.e. DVD))'
            case "format2":
                return 'Incorrect format input (must be some format, not an empty string (f.e. DVD))'
            case "format3":
                return 'Incorrect format input (must be a string)'
            case "actor":
                return 'Incorrect actor input (must be an array of names and surnames given separately (f.e. ["Mel Brooks", "Joaquin Phoenix"]))'
            case "actor2":
                return 'Incorrect actor input (every actor given must be a string)'
            case "actor3":
                return 'Incorrect actor input (must be a name and a surname given separately (f.e. Mel Brooks))'
            default:
                return 'Some incorrect input'
        }
    }
}