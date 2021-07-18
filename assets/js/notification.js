export function round1Notification(correct, self, username, paal){
    if(self) {
        if (correct) {
            toastr.success("Correct!");
        } else {
            toastr.warning("Wrong! you need to drink!");
        }
    } else{
        if (correct) {
            if(paal) {
                toastr.success(username + " has got a paal! Everyone drink!");
            }else{
                toastr.success(username + " Has guessed correct!");
            }
        } else {
            toastr.warning(username + " needs to drink!");
        }
    }
}