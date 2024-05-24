(function() {
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    // let hasHighlighted = false;    
    
    async function insertComments(inlineComments) {
      // if (hasHighlighted) {
      //   return;
      // }
      // hasHighlighted = true;

      console.log(inlineComments);
      for (var i = 0; i < inlineComments.length; i++) {
        let comment = inlineComments[i];
        let author = comment.author;
        let text = comment.comment_text;
        let link = linkToComment(comment.objectID)
        let quote = findQuote(text);
        let commentOnQuote = findComment(text);
        let timeSinceText = timeSince(comment.created_at_i*1000);
        highlight(quote, author, commentOnQuote, timeSinceText, link);
      }
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (message.command === "insertComments") {
        insertComments(message.data);
      }
    });
  })();

function timeSince(time) { // from https://stackoverflow.com/a/12475270
    var time_formats = [
      [60, 'seconds', 1], // 60
      [120, '1 minute ago', '1 minute from now'], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, '1 hour ago', '1 hour from now'], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      [2903040000, 'years', 29030400] // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    ];
    var seconds = (+new Date() - time) / 1000,
      token = 'ago',
      list_choice = 1;
  
    if (seconds == 0) {
      return 'Just now'
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      list_choice = 2;
    }
    var i = 0,
      format;
    while (format = time_formats[i++])
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  }

function linkToComment(commentId) {
  return "https://news.ycombinator.com/item?id=" + commentId
}

function findQuote(comment) {
  let split = comment.split("<p>")[0];
  let indentRemoved = split.replace("&gt;", "");
  let quotesRemoved = indentRemoved.replace("&quot;", "");
  let decoded = decodeHtml(quotesRemoved)
  let quotedAgainRemoved = decoded.replace('"', "");
  let trimmed = quotedAgainRemoved.trim();
  return trimmed;
}

function findComment(comment) {
  let split = comment.split("<p>").slice(1);
  let recombined = recombineComment(split);
  let decoded = decodeHtml(recombined);
  let quotedAgainRemoved = decoded.replace('"', "");
  let trimmed = quotedAgainRemoved.trim();
  return trimmed;
}

function recombineComment(splitComment) {
  let comment = "";
  for (var i = 0; i < splitComment.length; i++) {
    comment += splitComment[i] + '<br /><br />';
  }
  return comment;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function highlight(quote, author, comment, timeSinceText, link) {
  console.log(quote);

  var xpath = `//p[contains(text(),'${quote}')]`;
  var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  let insert = `
    <div class="phil-highlight">
       ${quote}
       <div class="phil-extension">
          <div class="phil-extension-header">
            <a href="https://news.ycombinator.com/user?id=${author}">${author}</a>
            <a href="${link}">${timeSinceText}</a>
          </div>
          <div class="phil-comment">
            <p>${comment}</p>
          </div>
       </div>
     </div>
  `;

  matchingElement.innerHTML = matchingElement.innerHTML.replace(new RegExp(quote, "gi"), insert);
}
  