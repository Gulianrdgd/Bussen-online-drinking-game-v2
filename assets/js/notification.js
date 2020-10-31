export function round1Notification(correct, self, username){
    if(self) {
        if (correct) {
            toastr.success("Correct!");
        } else {
            toastr.warning("Wrong! you need to drink!");
        }
    } else{
        if (correct) {
            toastr.success(username + " Has guessed correct!");
        } else {
            toastr.warning(username + " needs to drink!");
        }
    }
}