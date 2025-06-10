  this.FishGrammer = tracery.createGrammar({
            "Pronouns":["It", "They", "He", "She"],
            "Pronouns2":["Its", "Their", "His", "Her"],
            "move":["flock", "race", "glide", "dance", "flee", "lie"],
            "bird":["swan", "heron", "sparrow", "swallow", "wren", "robin"],
            "animal":["#bird#", "Turtle", "Banana Slug","Panda", "Bull", "Worm"],
            "specimen":["dreamer", "specimen", "fish", "trickster", "opportunist", "Oddity", "Witty fish", "laid back fish", "hungry fish", "prankster", "meal", "Undergraduate", "derpy fish"],
            "agent":["cloud", "wave", "#bird#", "boat", "ship"],
            "compass":["Western", "Eastern", "Southern", "Northern"],
            "location":[ "American ", "Asian ", "European ", "Middle-Eastern ", "", "Antartic ", "African ", "#compass# #location#", "Alaskan "],
            "transVerb":["forget", "plant", "greet", "remember", "embrace", "feel", "love"],
            "emotion":["sorrow", "gladness", "joy", "heartache", "love", "forgiveness", "grace", "lost", "empty"],
            "substance":["#emotion#", "mist", "fog", "glass", "silver", "rain", "dew", "cloud", "virtue", "sun", "shadow", "gold", "light", "darkness", "dad"],
            "adj":["fair", "bright", "splendid", "divine", "inseparable", "fine", "lazy", "grand", "slow", "quick", "graceful", "grave", "clear", "faint", "dreary"],
            "doThing":["come", "move", "cry", "weep", "laugh", "dream"],
            "verb":["fleck", "grace", "bless", "dapple", "touch", "caress", "smooth", "crown", "veil"],
            "verbed":["flecked", "graced", "blessed", "dappled", "touched", "caressed", "smoothed", "crowned", "veiled", "shaded", "unleashed"],
            "ground":["glen", "river", "vale", "sea", "meadow", "forest", "glade", "grass", "sky", "waves"],
            "poeticAdj":["#substance#-#verbed#"],
            "poeticDesc":["#poeticAdj#", "by #substance# #verb#'d", "#adj# with #substance#", "#verbed# with #substance#"],
            "ah":["ah", "alas", "oh", "yet", "but", "and", "unless"],
            "on":["on", "in", "above", "beneath", "under", "by", "within"],
            "punctutation":[",", ":", " ", "!", ".", "?"],
            "noun":["#ground#", "#agent#"],
            "fishtypes":["Salmon", "Trout", "SeaBear", "Guppy", "Minnow", "Angelfish", "Tetra", "Queenfish", "Catfish", "Needlefish", "Sunfish", "Danio", "Sturgeon", "Snapper"],
            "fishName":["#location##verbed# #ground# #fishtypes#", "#location##emotion# #fishtypes#", "#location##animal# #fishtypes#", "#location##agent# #fishtypes#", "#location##substance# #fishtypes#"],
            "Description":["#Pronouns# #move#s #on# #verbed# #ground# in #emotion#, #ah# #poeticDesc#", "A #adj# #specimen# that #doThing#s of #emotion#", "This #adj# creature #transVerb#s #Pronouns2# #poeticDesc#", 
                "#Pronouns# #doThing#s the idea of #animal#s #on# the #ground# but #Pronouns# is #doThing#s to embrace #compass# #emotion#", "#Pronouns# wants to #move# to the #location# land #ah# this #specimen# is #adj#",
                "A #specimen# #verbed# by #Pronouns2# will to become a #animal#", "A #adj# #specimen# #on# a misson to find #substance#", "Have you seen my #substance#?"],

        });
        //this.poem = this.ruleGrammar.flatten("#Description#");
class FishText{
    constructor(){
        this.name = FishGrammer.flatten("#fishName#");
        this.desc = FishGrammer.flatten("#Description#");
    }
    getname(){
        return this.name;
    }
    getdesc(){
        return this.desc;
    }
}