var scores;
var currentSport;

function editGame(game) {
    $('#id').val(game);
    $('.sport').val(currentSport);
    //$('#day').val(scores[game]); //finish
   // $('#month').val(scores[game]); //finish
    $('#time').val(scores[game].time);
    $('#opponent').val(scores[game].opponent);
    $('#dhsScore').val(parseInt(scores[game].dhsScore));
    $('#oppScore').val(parseInt(scores[game].oppScore));
    $('#game-editor').removeClass('hidden');
}

$('.sport-choice').click(function(e) {
    var sport = e.target.id;
    if (!currentSport) $('#new-game').removeClass('hidden');
    $.post("https://sports-nineage.c9users.io/games", {sport: sport}, function(data) {
        currentSport = sport;
        scores = JSON.parse(data);
        $('#game-list').empty();
        $.each(scores, function(key, val) {
            $('#game-editor').addClass('hidden');
            $('#game-list').append( "<li class='game-choice' id='" + key + "'><button onclick='editGame(\"" + key + "\");' class='btn btn-success'>" + val.opponent + ": " + val.cleanDate + "</button></li>" );
        });
    });
});

// This needs to be fixed so it knows what sport to add to
$('#new-game').click(function() {
    $('.sport').val(currentSport);
    //$('#day').val(scores[game]); //finish
   // $('#month').val(scores[game]); //finish
    $('#month').val(1);
    $('#day').val(1);
    $('#time').val("12:00");
    $('#opponent').val("");
    $('#new-game-editor').removeClass('hidden');
});